import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { RowSelectionState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { CustomerFormDialog } from "@/features/customers/CustomerFormDialog";
import { createCustomersColumns } from "@/features/customers/columns";
import {
  customersFilters,
  customersTableConfig,
} from "@/features/customers/config";
import {
  customersListQuery,
  useBulkDeleteCustomers,
  useDeleteCustomer,
} from "@/features/customers/queries";
import {
  type Customer,
  customerListParamsSchema,
} from "@/features/customers/schema";
import { DataTable, useTableSearch } from "@/infra/table";

export const Route = createFileRoute("/_app/customers")({
  validateSearch: customerListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(customersListQuery(deps)),
  component: CustomersPage,
});

type DialogState = { mode: "create" | "edit"; customer?: Customer } | null;

function CustomersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const table = useTableSearch(search, navigate);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const query = useQuery({
    ...customersListQuery(search),
    placeholderData: keepPreviousData,
  });

  const deleteCustomer = useDeleteCustomer();
  const bulkDelete = useBulkDeleteCustomers();
  const confirm = useConfirm();

  const columns = useMemo(
    () =>
      createCustomersColumns({
        onEdit: (customer) => setDialog({ mode: "edit", customer }),
        onDelete: async (customer) => {
          const ok = await confirm({
            title: `Delete “${customer.name}”?`,
            description: "This action cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
          });
          if (ok) deleteCustomer.mutate(customer.id);
        },
      }),
    [deleteCustomer, confirm],
  );

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="shrink-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Customers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accounts, plans, and monthly recurring revenue.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.rows ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isLoading || query.isFetching}
        searchValue={search.search}
        onSearchChange={table.setSearch}
        searchPlaceholder={customersTableConfig.searchPlaceholder}
        filters={customersFilters}
        filterValues={{ plan: search.plan, status: search.status }}
        onFilterChange={table.setFilter}
        onRefresh={() => query.refetch()}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        page={search.page}
        pageSize={search.pageSize}
        pageSizeOptions={customersTableConfig.pageSizeOptions}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyMessage={customersTableConfig.emptyMessage}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(customer) => customer.id}
        selectionActions={(ids) => (
          <Button
            variant="destructive"
            size="sm"
            disabled={bulkDelete.isPending}
            onClick={async () => {
              const ok = await confirm({
                title: `Delete ${ids.length} customer${ids.length === 1 ? "" : "s"}?`,
                description: "This action cannot be undone.",
                confirmLabel: "Delete",
                destructive: true,
              });
              if (ok) {
                await bulkDelete.mutateAsync(ids);
                setRowSelection({});
              }
            }}
          >
            <TrashIcon size={16} />
            Delete selected
          </Button>
        )}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add customer
          </Button>
        }
      />

      <CustomerFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        customer={dialog?.customer}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
