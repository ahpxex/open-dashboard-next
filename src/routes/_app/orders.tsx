import { PlusIcon } from "@phosphor-icons/react";
import {
  createFileRoute,
  Outlet,
  useChildMatches,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { Order } from "@/db/schema";
import { createOrdersColumns } from "@/features/orders/columns";
import { ordersFilters, ordersTableConfig } from "@/features/orders/config";
import { OrderFormDialog } from "@/features/orders/OrderFormDialog";
import { ordersListQuery, useDeleteOrder } from "@/features/orders/queries";
import { ordersListParamsSchema } from "@/features/orders/schema";
import { useResourceList } from "@/infra/list";
import { DataTable } from "@/infra/table";

export const Route = createFileRoute("/_app/orders")({
  validateSearch: ordersListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(ordersListQuery(deps)),
  component: OrdersPage,
});

type DialogState = { mode: "create" | "edit"; row?: Order } | null;

function OrdersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { table, rows, total, isLoading, refetch } = useResourceList<
    typeof search,
    Order
  >(search, navigate, ordersListQuery);
  const [dialog, setDialog] = useState<DialogState>(null);

  const remove = useDeleteOrder();
  const confirm = useConfirm();

  // When a child route (/orders/$id) is active, its id selects a row and the
  // detail renders in the side panel via <Outlet>. The list stays mounted.
  const childMatches = useChildMatches();
  const selectedId = (childMatches[0]?.params as { id?: string } | undefined)
    ?.id;

  const columns = useMemo(
    () =>
      createOrdersColumns({
        selectedId,
        onEdit: (row) => setDialog({ mode: "edit", row }),
        onDelete: async (row) => {
          const ok = await confirm({
            title: `Delete “${row.name}”?`,
            description: "This action cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
          });
          if (ok) remove.mutate(row.id);
        },
      }),
    [remove, confirm, selectedId],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          The Master-detail archetype — select a row to open its detail in a
          side panel (selection lives in the URL); the list stays mounted.
        </p>
      </div>

      <div className="flex flex-1 items-start gap-4">
        <div className="min-w-0 flex-1">
          <DataTable
            columns={columns}
            data={rows}
            total={total}
            isLoading={isLoading}
            searchValue={search.search}
            onSearchChange={table.setSearch}
            searchPlaceholder={ordersTableConfig.searchPlaceholder}
            filters={ordersFilters}
            filterValues={{ status: search.status }}
            onFilterChange={table.setFilter}
            onRefresh={refetch}
            sorting={table.sorting}
            onSortingChange={table.onSortingChange}
            page={search.page}
            pageSize={search.pageSize}
            pageSizeOptions={ordersTableConfig.pageSizeOptions}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
            emptyMessage={ordersTableConfig.emptyMessage}
            toolbarActions={
              <Button onClick={() => setDialog({ mode: "create" })}>
                <PlusIcon size={16} />
                Add order
              </Button>
            }
          />
        </div>

        <Outlet />
      </div>

      <OrderFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        row={dialog?.row}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
