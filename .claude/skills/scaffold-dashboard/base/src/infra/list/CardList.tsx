"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type FilterConfig,
  TablePaginationControls,
  TableToolbar,
  useDebouncedSearch,
} from "@/infra/table";

export interface CardListProps<T> {
  data: T[];
  total: number;
  isLoading?: boolean;

  renderCard: (item: T) => ReactNode;
  getKey: (item: T) => string;

  // search
  enableSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // filters
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onRefresh?: () => void;

  // pagination (controlled, 1-based)
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;

  toolbarActions?: ReactNode;
  emptyMessage?: string;
  /** Skeleton cards to show while loading. */
  skeletonCount?: number;
}

/**
 * Card/grid list — the gallery counterpart of `DataTable`. Same controlled,
 * server-driven contract (search/filter/paginate via the parent), but renders a
 * responsive grid of per-item cards instead of rows. Pair with `useResourceList`
 * so a card page shares a table page's data plumbing.
 */
export function CardList<T>({
  data,
  total,
  isLoading = false,
  renderCard,
  getKey,
  enableSearch = true,
  searchValue = "",
  onSearchChange,
  searchPlaceholder,
  filters = [],
  filterValues = {},
  onFilterChange,
  onRefresh,
  page,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  toolbarActions,
  emptyMessage = "No results.",
  skeletonCount = 6,
}: CardListProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [localSearch, handleSearchChange] = useDebouncedSearch(
    searchValue,
    onSearchChange ?? (() => {}),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <TableToolbar
            enableSearch={enableSearch}
            searchValue={localSearch}
            onSearchChange={handleSearchChange}
            searchPlaceholder={searchPlaceholder}
            filters={filters}
            filterValues={filterValues}
            onFilterChange={onFilterChange}
            onRefresh={onRefresh}
            isLoading={isLoading}
          />
        </div>
        {toolbarActions ? (
          <div className="mb-4 shrink-0">{toolbarActions}</div>
        ) : null}
      </div>

      {/* Cards outline with `ring-1` (drawn OUTSIDE the box), so the scroll
          container needs padding on ALL sides — the matching negative margin
          keeps the layout flush — or the top/bottom rings clip at the scroll
          edges (only `px` here left them clipped vertically). */}
      <div className="-m-0.5 min-h-0 flex-1 overflow-auto p-0.5">
        {isLoading && data.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: skeletonCount }, (_, i) => (
              <Skeleton key={`skeleton-${i}`} className="h-40 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="grid h-40 place-items-center border border-border text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <div key={getKey(item)}>{renderCard(item)}</div>
            ))}
          </div>
        )}
      </div>

      <TablePaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
