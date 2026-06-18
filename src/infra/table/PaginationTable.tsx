"use client";

import { CaretDown, CaretUp } from "@phosphor-icons/react";
import {
  type BaseRecord,
  type CrudFilter,
  type CrudFilters,
  type LogicalFilter,
  useTable,
} from "@refinedev/core";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type React from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { TablePaginationControls } from "./TablePaginationControls";
import { TableToolbar } from "./TableToolbar";
import type { PaginationTableProps, PaginationTableRef } from "./types";

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 25, 50];

const getFilterValue = (filters: CrudFilter[], key: string) => {
  const match = filters.find(
    (filter) => "field" in filter && filter.field === key,
  );
  return (match?.value as string) ?? "";
};

const upsertFilter = (
  filters: CrudFilter[],
  key: string,
  value: string,
  operator: LogicalFilter["operator"] = "eq",
): CrudFilter[] => {
  const withoutKey = filters.filter(
    (filter) => "field" in filter && filter.field !== key,
  );

  if (!value) {
    return withoutKey;
  }

  return [
    ...withoutKey,
    {
      field: key,
      operator,
      value,
    } as LogicalFilter,
  ];
};

function PaginationTableInner<TData extends BaseRecord>(
  {
    resource,
    columns,
    filters = [],
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    defaultPageSize = 10,
    enableSearch = true,
    searchPlaceholder = "Search all columns...",
    emptyMessage = "No data found",
    className = "",
    getRowId,
    permanentFilters = [],
    permanentSorters = [],
    onTotalsChange,
    enableSelection = false,
    onSelectionChange,
  }: PaginationTableProps<TData>,
  ref: React.Ref<PaginationTableRef>,
) {
  const {
    tableQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sorters,
    setSorters,
    filters: activeFilters,
    setFilters,
  } = useTable<TData>({
    resource,
    pagination: {
      pageSize: defaultPageSize,
    },
    sorters: {
      initial: permanentSorters ?? [],
    },
    filters: {
      initial: permanentFilters ?? [],
    },
  });

  const data = (tableQuery.data?.data ?? []) as TData[];
  const totalCount = tableQuery.data?.total ?? 0;
  const isLoading = tableQuery.isLoading || tableQuery.isFetching;
  const totalPages =
    totalCount === 0 ? 0 : Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    onTotalsChange?.({
      totalCount,
      currentPage,
      pageSize,
    });
  }, [onTotalsChange, totalCount, currentPage, pageSize]);

  const filterValues = useMemo(() => {
    const values: Record<string, string> = {};
    activeFilters.forEach((filter) => {
      if ("field" in filter && typeof filter.value === "string") {
        values[String(filter.field)] = filter.value;
      }
    });
    return values;
  }, [activeFilters]);

  const [searchValue, setSearchValue] = useState(filterValues.q ?? "");

  useEffect(() => {
    setSearchValue(filterValues.q ?? "");
  }, [filterValues.q]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      setFilters((previous) => upsertFilter(previous, "q", value, "contains"));
    },
    [setFilters],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilters((previous) => upsertFilter(previous, key, value));
    },
    [setFilters],
  );

  const handleSortChange = useCallback(
    (columnId: string) => {
      const existing = sorters?.[0];
      if (existing && existing.field === columnId) {
        setSorters([
          {
            field: columnId,
            order: existing.order === "asc" ? "desc" : "asc",
          },
        ]);
      } else {
        setSorters([
          {
            field: columnId,
            order: "asc",
          },
        ]);
      }
    },
    [setSorters, sorters],
  );

  const currentSorter = sorters?.[0];
  const sortBy = currentSorter?.field ? String(currentSorter.field) : "";
  const sortOrder = currentSorter?.order ?? "asc";

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const isSelectable = enableSelection;

  const resolveRowId = useCallback(
    (row: TData): string => {
      if (getRowId) {
        return getRowId(row);
      }

      const candidate = (row as { id?: string | number | null | undefined }).id;

      if (candidate === undefined || candidate === null) {
        console.warn(
          "PaginationTable: getRowId was not provided and row is missing an id property. Falling back to JSON serialization, which may be unstable.",
          row,
        );

        return JSON.stringify(row);
      }

      return String(candidate);
    },
    [getRowId],
  );

  const validRowIds = useMemo(() => {
    if (!isSelectable) {
      return new Set<string>();
    }

    return new Set(data.map((row) => resolveRowId(row)));
  }, [data, isSelectable, resolveRowId]);

  const emitSelectionChange = useCallback(
    (nextSelected: Set<string>) => {
      if (!isSelectable || !onSelectionChange) {
        return;
      }

      const selectedRows = data.filter((row) =>
        nextSelected.has(resolveRowId(row)),
      );

      onSelectionChange({
        ids: Array.from(nextSelected),
        rows: selectedRows,
      });
    },
    [data, isSelectable, onSelectionChange, resolveRowId],
  );

  const updateSelection = useCallback(
    (updater: (current: Set<string>) => Set<string>) => {
      if (!isSelectable) {
        return;
      }

      setSelectedKeys((previous) => updater(new Set(previous)));
    },
    [isSelectable],
  );

  useEffect(() => {
    setSelectedKeys((previous) => {
      const filtered = new Set<string>();

      previous.forEach((key) => {
        if (validRowIds.has(key)) {
          filtered.add(key);
        }
      });

      return filtered;
    });
  }, [validRowIds]);

  useEffect(() => {
    emitSelectionChange(selectedKeys);
  }, [emitSelectionChange, selectedKeys]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useImperativeHandle(
    ref,
    () => ({
      refresh: () => {
        tableQuery.refetch();
      },
      resetPage: () => {
        setCurrentPage(1);
      },
      getTotalCount: () => totalCount,
      getCurrentPage: () => currentPage,
      isLoading: () => isLoading,
      getSelectedKeys: () => new Set(selectedKeys),
      clearSelection: () => setSelectedKeys(new Set()),
      selectAll: () => {
        if (!isSelectable) {
          return;
        }
        setSelectedKeys(new Set(validRowIds));
      },
    }),
    [
      currentPage,
      isLoading,
      isSelectable,
      selectedKeys,
      setCurrentPage,
      tableQuery,
      totalCount,
      validRowIds,
    ],
  );

  return (
    <div className={`flex flex-1 min-h-0 flex-col ${className}`}>
      <TableToolbar
        enableSearch={enableSearch}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onRefresh={() => tableQuery.refetch()}
        isLoading={isLoading}
      />

      <div className="relative flex-1 overflow-auto rounded-none border border-gray-200 dark:border-gray-800">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <table className="w-full min-w-max divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {isSelectable ? (
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      <Checkbox
                        checked={
                          selectedKeys.size > 0 &&
                          selectedKeys.size === validRowIds.size
                        }
                        indeterminate={
                          selectedKeys.size > 0 &&
                          selectedKeys.size < validRowIds.size
                        }
                        onCheckedChange={(value) => {
                          if (value) {
                            updateSelection(() => new Set(validRowIds));
                          } else {
                            updateSelection(() => new Set());
                          }
                        }}
                        aria-label="Select all rows"
                      />
                    </th>
                  ) : null}
                  {headerGroup.headers.map((header) => {
                    const columnDef = header.column.columnDef as {
                      id?: string;
                      accessorKey?: string;
                    };
                    const columnId =
                      columnDef.id ?? columnDef.accessorKey ?? "";
                    const isSorted = sortBy === columnId;
                    return (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        <button
                          className="flex items-center gap-1 text-left uppercase tracking-wider"
                          type="button"
                          onClick={() => handleSortChange(columnId)}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <span className="inline-flex flex-col">
                            <CaretUp
                              weight="bold"
                              className={`-mb-1 h-3 w-3 ${
                                isSorted && sortOrder === "asc"
                                  ? "text-primary"
                                  : "text-gray-400"
                              }`}
                            />
                            <CaretDown
                              weight="bold"
                              className={`h-3 w-3 ${
                                isSorted && sortOrder === "desc"
                                  ? "text-primary"
                                  : "text-gray-400"
                              }`}
                            />
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
              {table.getRowModel().rows.map((row) => {
                const rowId = resolveRowId(row.original);
                const isSelected = selectedKeys.has(rowId);
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isSelected
                        ? "bg-primary/5 dark:bg-primary/10"
                        : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    }`}
                  >
                    {isSelectable ? (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(value) => {
                            if (value) {
                              updateSelection((previous) =>
                                new Set(previous).add(rowId),
                              );
                              return;
                            }
                            updateSelection((previous) => {
                              const next = new Set(previous);
                              next.delete(rowId);
                              return next;
                            });
                          }}
                          aria-label="Select row"
                        />
                      </td>
                    ) : null}
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <TablePaginationControls
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}

export const PaginationTable = forwardRef(PaginationTableInner) as <
  TData extends BaseRecord,
>(
  props: PaginationTableProps<TData> & {
    ref?: React.Ref<PaginationTableRef>;
  },
) => React.ReactElement;
