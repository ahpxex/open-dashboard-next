import type { ColumnDef } from "@tanstack/react-table";
import { type ChipColor, StatusChip } from "@/infra/ui";
import type { SelectableProduct, SelectableProductStatus } from "./types";

const statusColorMap: Record<SelectableProductStatus, ChipColor> = {
  active: "success",
  "out-of-stock": "warning",
  discontinued: "danger",
};

export const selectablesColumns: ColumnDef<SelectableProduct>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => (
      <div className="flex flex-col">
        <span className="font-medium">{info.getValue() as string}</span>
        <span className="text-xs text-gray-500">{info.row.original.sku}</span>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: (info) => (
      <span className="text-gray-600 dark:text-gray-400">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: (info) => (
      <span className="text-gray-600 dark:text-gray-400">
        ${(info.getValue() as number).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: (info) => (
      <span className="text-gray-600 dark:text-gray-400">
        {info.getValue() as number}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => (
      <StatusChip
        status={info.getValue() as SelectableProductStatus}
        colorMap={statusColorMap}
      />
    ),
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
    cell: (info) => (
      <span className="text-gray-600 dark:text-gray-400">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "lastRestocked",
    header: () => <div className="flex items-center gap-1">Last Restocked</div>,
    cell: (info) => (
      <span className="text-gray-600 dark:text-gray-400">
        {info.getValue() as string}
      </span>
    ),
  },
];
