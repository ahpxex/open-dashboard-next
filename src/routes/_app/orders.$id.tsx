import { PencilSimpleIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { statusColorMap } from "@/features/orders/columns";
import { OrderFormDialog } from "@/features/orders/OrderFormDialog";
import { orderDetailQuery, useDeleteOrder } from "@/features/orders/queries";
import type { OrderStatus } from "@/features/orders/schema";
import { DescriptionList, StatusChip } from "@/infra/ui";

export const Route = createFileRoute("/_app/orders/$id")({
  loader: async ({ context, params }) => {
    const order = await context.queryClient.ensureQueryData(
      orderDetailQuery(params.id),
    );
    if (!order) throw notFound();
  },
  component: OrderPanel,
});

function OrderPanel() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const remove = useDeleteOrder();
  const [editing, setEditing] = useState(false);

  const query = useQuery(orderDetailQuery(id));
  const order = query.data;

  const close = () => navigate({ to: "/orders", search: (prev) => prev });

  async function onDelete() {
    if (!order) return;
    const ok = await confirm({
      title: `Delete “${order.name}”?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) {
      await remove.mutateAsync(order.id);
      close();
    }
  }

  return (
    <aside className="w-full shrink-0 border border-border p-5 lg:w-96">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          {order ? (
            <>
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-semibold">
                  {order.name}
                </h2>
                <StatusChip
                  status={order.status as OrderStatus}
                  colorMap={statusColorMap}
                />
              </div>
            </>
          ) : (
            <Skeleton className="h-5 w-32" />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={close}
          aria-label="Close panel"
        >
          <XIcon size={16} />
        </Button>
      </div>

      {order ? (
        <div className="mt-5 flex flex-col gap-5">
          <DescriptionList
            columns={1}
            items={[
              { label: "Status", value: order.status },
              {
                label: "Created",
                value: new Date(order.createdAt).toLocaleString(),
              },
              {
                label: "Updated",
                value: new Date(order.updatedAt).toLocaleString(),
              },
              {
                label: "Description",
                value: order.description || "—",
                full: true,
              },
            ]}
          />

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(true)}>
              <PencilSimpleIcon size={16} />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={remove.isPending}
            >
              <TrashIcon size={16} />
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <Skeleton className="mt-5 h-32 w-full" />
      )}

      <OrderFormDialog
        open={editing}
        mode="edit"
        row={order ?? undefined}
        onOpenChange={setEditing}
      />
    </aside>
  );
}
