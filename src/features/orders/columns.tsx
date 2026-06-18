import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { Order } from "@/db/schema";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";
import type { OrderStatus } from "./schema";

export const statusColorMap: Record<OrderStatus, ChipColor> = {
  active: "success",
  archived: "default",
};

export interface OrderTableContext {
  onEdit: (row: Order) => void;
  onDelete: (row: Order) => void;
  /** Currently selected row id (for the master-detail panel). */
  selectedId?: string;
}

export function createOrdersColumns(
  context: OrderTableContext,
): ColumnDef<Order>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => {
        const row = info.row.original;
        return (
          <Link
            to="/orders/$id"
            params={{ id: row.id }}
            className={
              context.selectedId === row.id
                ? "font-semibold underline"
                : "font-medium hover:underline"
            }
          >
            {info.getValue() as string}
          </Link>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as OrderStatus}
          colorMap={statusColorMap}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex justify-end">
            <ActionMenu
              onEdit={() => context.onEdit(row)}
              onDelete={() => context.onDelete(row)}
            />
          </div>
        );
      },
    },
  ];
}
