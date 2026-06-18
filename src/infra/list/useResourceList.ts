import {
  keepPreviousData,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { ListResult } from "@/infra/data";
import {
  type BaseListSearch,
  type SearchNavigate,
  type TableSearchState,
  useTableSearch,
} from "@/infra/table";

export interface ResourceList<T> {
  /** URL-backed list controls (search/sort/filter/page setters). */
  table: TableSearchState;
  rows: T[];
  total: number;
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Bundles the URL-synced list state and the resource query behind one hook, so
 * a table page and a card-list page share identical data plumbing — only the
 * presentation (DataTable vs CardList) differs. Pass the route's `useSearch()`
 * value, `useNavigate()`, and the resource's list `queryOptions` factory.
 */
export function useResourceList<TSearch extends BaseListSearch, T>(
  search: TSearch,
  navigate: SearchNavigate<TSearch>,
  queryFactory: (
    search: TSearch,
  ) => UseQueryOptions<ListResult<T>, any, ListResult<T>, any>,
): ResourceList<T> {
  const table = useTableSearch(search, navigate);
  const query = useQuery({
    ...queryFactory(search),
    placeholderData: keepPreviousData,
  });

  return {
    table,
    rows: query.data?.rows ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading || query.isFetching,
    refetch: () => query.refetch(),
  };
}
