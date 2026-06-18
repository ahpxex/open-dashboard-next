import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { useMemo } from "react";
import type { SortDir } from "./types";

/**
 * The minimum search shape every list route shares. A resource's
 * `validateSearch` schema (e.g. `productListParamsSchema`) extends this with its
 * own filter keys, and the whole object lives in the URL — so list views are
 * shareable and the browser back/forward buttons work.
 */
export interface BaseListSearch {
  page: number;
  pageSize: number;
  search: string;
  sortBy?: string;
  sortDir?: SortDir;
}

export type SearchNavigate<TSearch> = (opts: {
  search: (prev: TSearch) => TSearch;
}) => unknown;

export interface TableSearchState {
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (value: string) => void;
  setFilter: (key: string, value: string) => void;
}

/**
 * Bridges a route's URL search params to the controlled `DataTable` props.
 * Every mutation writes back to the URL via `navigate`; filters/search/sort
 * changes reset to page 1. Pass the route's `useSearch()` value and
 * `useNavigate()` function.
 */
export function useTableSearch<TSearch extends BaseListSearch>(
  search: TSearch,
  navigate: SearchNavigate<TSearch>,
): TableSearchState {
  return useMemo(() => {
    const update = (patch: Partial<TSearch>, resetPage = false) =>
      navigate({
        search: (prev) => ({
          ...prev,
          ...patch,
          ...(resetPage ? { page: 1 } : null),
        }),
      });

    const sorting: SortingState = search.sortBy
      ? [{ id: search.sortBy, desc: search.sortDir === "desc" }]
      : [];

    const onSortingChange: OnChangeFn<SortingState> = (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      update(
        {
          sortBy: first?.id,
          sortDir: first ? (first.desc ? "desc" : "asc") : undefined,
        } as Partial<TSearch>,
        true,
      );
    };

    return {
      sorting,
      onSortingChange,
      setPage: (page: number) => update({ page } as Partial<TSearch>),
      setPageSize: (pageSize: number) =>
        update({ pageSize } as Partial<TSearch>, true),
      setSearch: (value: string) =>
        update({ search: value } as Partial<TSearch>, true),
      setFilter: (key: string, value: string) =>
        update({ [key]: value } as Partial<TSearch>, true),
    };
  }, [search, navigate]);
}
