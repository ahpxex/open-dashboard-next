import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListParams, ListResult, Repository } from "@/infra/data/repository";

/**
 * Supabase implementation of {@link Repository} — backs a resource with a
 * Supabase (PostgREST) table via `@supabase/supabase-js`. Unlike `restRepository`
 * it does NOT speak the json-server dialect; it uses the supabase-js query
 * builder and `count: "exact"` (PostgREST `Content-Range`) for the total.
 *
 * Server-only: build the client with the service-role key (or anon key + a
 * forwarded user JWT) inside the resource's `server.ts`, so the key never reaches
 * the browser. Swapping a resource to Supabase touches only its `server.ts`
 * binding — queries, table, forms, and detail pages are unchanged.
 *
 * Activate: `bun add @supabase/supabase-js @supabase/ssr`. See
 * `backends/supabase/README.md` and `frontend-wiring/README.md`.
 */
export interface SupabaseRepositoryConfig<T, TInput, TRaw> {
  /** A server-side Supabase client (service-role key on the trusted hop). */
  client: SupabaseClient;
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

  return {
    async list(params: ListParams): Promise<ListResult<T>> {
      let query = client.from(table).select("*", { count: "exact" });

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
      const { data, error } = await client
        .from(table)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(`Supabase getOne failed: ${error.message}`);
      return data ? map(data as TRaw) : null;
    },

    async create(input) {
      const { data, error } = await client
        .from(table)
        .insert(serialize(input))
        .select()
        .single();
      if (error) throw new Error(`Supabase create failed: ${error.message}`);
      return map(data as TRaw);
    },

    async update(id, input) {
      const { data, error } = await client
        .from(table)
        .update(serialize(input))
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(`Supabase update failed: ${error.message}`);
      return map(data as TRaw);
    },

    async remove(id) {
      const { error } = await client.from(table).delete().eq("id", id);
      if (error) throw new Error(`Supabase remove failed: ${error.message}`);
    },
  };
}
