import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListParams, ListResult, Repository } from "@/infra/data/repository";

/**
 * Supabase implementation of {@link Repository} — backs a resource with a
 * Supabase (PostgREST) table via `@supabase/supabase-js`. Unlike `restRepository`
 * it does NOT speak the json-server dialect; it uses the supabase-js query
 * builder and `count: "exact"` (PostgREST `Content-Range`) for the total.
 *
 * Server-only: build the client inside the resource's `server.ts`, so the key
 * never reaches the browser. The DEFAULT data path should use the anon key plus
 * the request's user JWT (so PostgREST runs as the `authenticated` role and the
 * table's RLS policies are enforced) — pass a `client` factory that builds a
 * fresh, request-scoped client per call. The service-role key (which bypasses
 * RLS) is reserved for explicitly-admin operations, not the per-user data path.
 * Swapping a resource to Supabase touches only its `server.ts` binding — queries,
 * table, forms, and detail pages are unchanged.
 *
 * Activate: `bun add @supabase/supabase-js @supabase/ssr`. See
 * `backends/supabase/README.md` and `frontend-wiring/README.md`.
 */
export interface SupabaseRepositoryConfig<T, TInput, TRaw> {
  /**
   * The server-side Supabase client, or a factory that returns one per request.
   * Prefer a factory that builds an anon-key client carrying the user's JWT so
   * RLS applies; a single client is fine only for an admin/service-role binding.
   */
  client: SupabaseClient | (() => SupabaseClient);
  /** Table name, e.g. `"products"`. */
  table: string;
  /** Map a raw PostgREST row (snake_case) to the resource type (camelCase). */
  map: (raw: TRaw) => T;
  /** Map a (partial) input to a row; defaults to identity. Omit server-owned columns. */
  serialize?: (input: Partial<TInput>) => Record<string, unknown>;
  /** Columns OR-searched (case-insensitive `ilike`) for `params.search`. */
  searchColumns?: string[];
  /** Resource sort key -> DB column (whitelist). Anything else falls back to default. */
  sortColumns?: Record<string, string>;
  /** Resource filter key -> DB column (whitelist) for exact-match `params.filters`. */
  filterColumns?: Record<string, string>;
  /** Default sort when none/invalid is requested. */
  defaultSort: { column: string; ascending: boolean };
}

/**
 * Thrown by `update`/`remove` when no row matches the id. Mirrors the contract:
 * `getOne` maps a missing row to `null`, but a write to a missing id must surface
 * not-found rather than silently succeed (consistent with `restRepository`, where
 * a 404 on PATCH/DELETE throws). The server fn turns this into a 404 for the page.
 */
export class NotFoundError extends Error {
  constructor(table: string, id: string) {
    super(`${table} row not found: ${id}`);
    this.name = "NotFoundError";
  }
}

/** Strip PostgREST filter metacharacters so a search term can't break `.or(...)`. */
function sanitize(term: string): string {
  return term.replace(/[,()%\\*]/g, " ").trim();
}

export function supabaseRepository<T, TInput, TRaw = Record<string, unknown>>(
  config: SupabaseRepositoryConfig<T, TInput, TRaw>,
): Repository<T, TInput> {
  const {
    client,
    table,
    map,
    serialize = (input) => input as Record<string, unknown>,
    searchColumns = [],
    sortColumns = {},
    filterColumns = {},
    defaultSort,
  } = config;

  // Resolve a client per operation so a request-scoped (anon + user JWT) factory
  // is honored; a plain client is returned as-is.
  const resolve = (): SupabaseClient =>
    typeof client === "function" ? client() : client;

  return {
    async list(params: ListParams): Promise<ListResult<T>> {
      let query = resolve().from(table).select("*", { count: "exact" });

      const term = params.search ? sanitize(params.search) : "";
      if (term && searchColumns.length > 0) {
        query = query.or(
          searchColumns.map((col) => `${col}.ilike.%${term}%`).join(","),
        );
      }

      if (params.filters) {
        for (const [key, value] of Object.entries(params.filters)) {
          const column = filterColumns[key];
          if (column && value) query = query.eq(column, value);
        }
      }

      const column =
        (params.sortBy && sortColumns[params.sortBy]) || defaultSort.column;
      const ascending = params.sortDir
        ? params.sortDir === "asc"
        : defaultSort.ascending;
      query = query.order(column, { ascending });

      const from = (params.page - 1) * params.pageSize;
      query = query.range(from, from + params.pageSize - 1);

      const { data, count, error } = await query;
      if (error) throw new Error(`Supabase list failed: ${error.message}`);
      return { rows: (data ?? []).map((row) => map(row as TRaw)), total: count ?? 0 };
    },

    async getOne(id) {
      const { data, error } = await resolve()
        .from(table)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(`Supabase getOne failed: ${error.message}`);
      return data ? map(data as TRaw) : null;
    },

    async create(input) {
      const { data, error } = await resolve()
        .from(table)
        .insert(serialize(input))
        .select()
        .single();
      if (error) throw new Error(`Supabase create failed: ${error.message}`);
      return map(data as TRaw);
    },

    async update(id, input) {
      // `maybeSingle()` (not `single()`) so a no-match returns `null` instead of a
      // PostgREST error — we translate that to a typed NotFoundError. (A row the
      // user's RLS can't see is indistinguishable from a missing row here, which
      // is the intended behavior: it must surface as not-found.)
      const { data, error } = await resolve()
        .from(table)
        .update(serialize(input))
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) throw new Error(`Supabase update failed: ${error.message}`);
      if (!data) throw new NotFoundError(table, id);
      return map(data as TRaw);
    },

    async remove(id) {
      // Ask PostgREST to return the deleted rows (`.select()`); an empty result
      // means nothing matched the id, which must surface as not-found rather than
      // silently succeed (DELETE on a missing row is otherwise a 0-row no-op).
      const { data, error } = await resolve()
        .from(table)
        .delete()
        .eq("id", id)
        .select();
      if (error) throw new Error(`Supabase remove failed: ${error.message}`);
      if (!data || data.length === 0) throw new NotFoundError(table, id);
    },
  };
}
