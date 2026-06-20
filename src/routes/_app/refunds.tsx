import { PlusIcon } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { createRefundsColumns } from "@/features/refunds/columns";
import { refundsFilters, refundsTableConfig } from "@/features/refunds/config";
import { refundsListQuery, useDeleteRefund } from "@/features/refunds/queries";
import { RefundFormDialog } from "@/features/refunds/RefundFormDialog";
import { type Refund, refundListParamsSchema } from "@/features/refunds/schema";
import { DataTable, useTableSearch } from "@/infra/table";

export const Route = createFileRoute("/_app/refunds")({
  validateSearch: refundListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(refundsListQuery(deps)),
  component: RefundsPage,
});

type DialogState = { mode: "create" | "edit"; refund?: Refund } | null;

function RefundsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const table = useTableSearch(search, navigate);
  const [dialog, setDialog] = useState<DialogState>(null);

  const query = useQuery({
    ...refundsListQuery(search),
    placeholderData: keepPreviousData,
  });

  const deleteRefund = useDeleteRefund();
  const confirm = useConfirm();

  const columns = useMemo(
    () =>
      createRefundsColumns({
        onEdit: (refund) => setDialog({ mode: "edit", refund }),
        onDelete: async (refund) => {
          const ok = await confirm({
            title: `Delete refund ${refund.orderRef}?`,
            description: "This action cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
          });
          if (ok) deleteRefund.mutate(refund.id);
        },
      }),
    [deleteRefund, confirm],
  );

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="shrink-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Refunds
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and resolve refund requests.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.rows ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isLoading || query.isFetching}
        searchValue={search.search}
        onSearchChange={table.setSearch}
        searchPlaceholder={refundsTableConfig.searchPlaceholder}
        filters={refundsFilters}
        filterValues={{ status: search.status, reason: search.reason }}
        onFilterChange={table.setFilter}
        onRefresh={() => query.refetch()}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        page={search.page}
        pageSize={search.pageSize}
        pageSizeOptions={refundsTableConfig.pageSizeOptions}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyMessage={refundsTableConfig.emptyMessage}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            New refund
          </Button>
        }
      />

      <RefundFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        refund={dialog?.refund}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
