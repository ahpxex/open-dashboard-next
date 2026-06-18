import { CaretDown, CaretUp } from "@phosphor-icons/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePaginationControls } from "./TablePaginationControls";
import { TableToolbar } from "./TableToolbar";
import type { FilterConfig } from "./types";
import { useDebouncedSearch } from "./useDebouncedSearch";

export interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  total: number;
  isLoading?: boolean;

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

  // sorting (controlled, server-side)
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;

  // pagination (controlled, 1-based page)
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;

  toolbarActions?: ReactNode;
  emptyMessage?: string;
}

/**
 * Generic, fully-controlled data table for server-driven resources.
 * Pagination, sorting, search and filtering state live in the parent
 * (usually backed by TanStack Query). Reused by every `features/<name>` page.
 */
export function DataTable<T>({
  columns,
  data,
  total,
  isLoading = false,
  enableSearch = true,
  searchValue = "",
  onSearchChange,
  searchPlaceholder,
  filters = [],
  filterValues = {},
  onFilterChange,
  onRefresh,
  sorting = [],
  onSortingChange,
  page,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  toolbarActions,
  emptyMessage = "No results.",
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Buffer the search box locally and debounce writes to the (URL-backed)
  // searchValue so fast typing stays responsive and doesn't drop keystrokes.
  const [localSearch, handleSearchChange] = useDebouncedSearch(
    searchValue,
    onSearchChange ?? (() => {}),
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const showToolbar =
    enableSearch ||
    filters.length > 0 ||
    Boolean(onRefresh) ||
    Boolean(toolbarActions);

  return (
    <div className="flex flex-col">
      {showToolbar ? (
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
      ) : null}

      <div className="overflow-hidden rounded-none border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  if (header.isPlaceholder) {
                    return <TableHead key={header.id} />;
                  }
                  const content = flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  );
                  return (
                    <TableHead key={header.id}>
                      {canSort ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 select-none"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {content}
                          {sorted === "asc" ? (
                            <CaretUp size={12} weight="bold" />
                          ) : sorted === "desc" ? (
                            <CaretDown size={12} weight="bold" />
                          ) : null}
                        </button>
                      ) : (
                        content
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
