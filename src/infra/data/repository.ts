export type SortDir = "asc" | "desc";

/**
 * The one list-request shape every resource speaks, regardless of backend.
 * `filters` is an open map of `key -> value` (e.g. `{ status: "active" }`); an
 * adapter maps each key to however its backend filters.
 */
export interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: SortDir;
  filters?: Record<string, string>;
}

/** The one list-response shape: a page of rows plus the unfiltered-by-page total. */
export interface ListResult<T> {
  rows: T[];
  total: number;
}

/**
 * The portability seam. Page archetypes (table, detail, card list) are written
 * against this interface — never against Drizzle or `fetch` directly. A resource
 * picks an adapter (`drizzleRepository`, `restRepository`, …) and the rest of the
 * vertical is unchanged regardless of where the data lives.
 *
 * Implementations run **server-side only** (inside `createServerFn` handlers), so
 * credentials and DB clients never reach the browser bundle.
 */
export interface Repository<T, TInput> {
  list(params: ListParams): Promise<ListResult<T>>;
  getOne(id: string): Promise<T | null>;
  create(input: TInput): Promise<T>;
  update(id: string, input: Partial<TInput>): Promise<T>;
  remove(id: string): Promise<void>;
}
