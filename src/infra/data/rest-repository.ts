import type { ListParams, ListResult, Repository } from "./repository";

export interface RestRepositoryConfig<T, TInput, TRaw = unknown> {
  /** API origin, e.g. "https://jsonplaceholder.typicode.com". */
  baseUrl: string;
  /** Collection path, e.g. "/posts". */
  path: string;
  /** Map a raw API record to the resource type. */
  map: (raw: TRaw) => T;
  /** Map a (partial) input to the request body. Defaults to the input as-is. */
  serialize?: (input: Partial<TInput>) => unknown;
  /** Static headers (e.g. an API key). Set server-side — never reaches the client. */
  headers?: Record<string, string>;
  /** Query-param names; defaults match json-server (jsonplaceholder). */
  params?: {
    page?: string;
    pageSize?: string;
    sort?: string;
    order?: string;
    search?: string;
  };
  /** Response header carrying the unfiltered total (json-server: x-total-count). */
  totalHeader?: string;
}

const DEFAULT_PARAMS = {
  page: "_page",
  pageSize: "_limit",
  sort: "_sort",
  order: "_order",
  search: "q",
};

/**
 * REST implementation of {@link Repository} — proxies a JSON HTTP API. Because
 * it runs inside a server fn, API origins and keys stay on the server. Swapping
 * a resource from Drizzle to REST is just changing its `server.ts` binding; the
 * queries, table, forms, and detail pages are untouched.
 *
 * Defaults target a json-server-style API (`_page`/`_limit`/`_sort`/`_order`/`q`
 * + `x-total-count`); override `params`/`totalHeader` for other shapes.
 */
export function restRepository<T, TInput, TRaw = unknown>(
  config: RestRepositoryConfig<T, TInput, TRaw>,
): Repository<T, TInput> {
  const p = { ...DEFAULT_PARAMS, ...config.params };
  const headers = { "content-type": "application/json", ...config.headers };
  const collectionUrl = `${config.baseUrl}${config.path}`;
  const itemUrl = (id: string) => `${collectionUrl}/${encodeURIComponent(id)}`;
  const body = (input: Partial<TInput>) =>
    JSON.stringify(config.serialize ? config.serialize(input) : input);

  return {
    async list(params: ListParams): Promise<ListResult<T>> {
      const query = new URLSearchParams();
      query.set(p.page, String(params.page));
      query.set(p.pageSize, String(params.pageSize));
      if (params.search) query.set(p.search, params.search);
      if (params.sortBy) {
        query.set(p.sort, params.sortBy);
        query.set(p.order, params.sortDir ?? "asc");
      }
      if (params.filters) {
        for (const [key, value] of Object.entries(params.filters)) {
          if (value) query.set(key, value);
        }
      }

      const res = await fetch(`${collectionUrl}?${query}`, { headers });
      if (!res.ok) throw new Error(`REST list failed (${res.status})`);
      const raw = (await res.json()) as TRaw[];
      const totalHeader = res.headers.get(
        config.totalHeader ?? "x-total-count",
      );
      const total = totalHeader ? Number(totalHeader) : raw.length;
      return { rows: raw.map(config.map), total };
    },

    async getOne(id) {
      const res = await fetch(itemUrl(id), { headers });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`REST getOne failed (${res.status})`);
      return config.map((await res.json()) as TRaw);
    },

    async create(input) {
      const res = await fetch(collectionUrl, {
        method: "POST",
        headers,
        body: body(input),
      });
      if (!res.ok) throw new Error(`REST create failed (${res.status})`);
      return config.map((await res.json()) as TRaw);
    },

    async update(id, input) {
      const res = await fetch(itemUrl(id), {
        method: "PATCH",
        headers,
        body: body(input),
      });
      if (!res.ok) throw new Error(`REST update failed (${res.status})`);
      return config.map((await res.json()) as TRaw);
    },

    async remove(id) {
      const res = await fetch(itemUrl(id), { method: "DELETE", headers });
      if (!res.ok) throw new Error(`REST remove failed (${res.status})`);
    },
  };
}
