import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@/db/schema";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";
import type { ProductStatus } from "./schema";

export const statusColorMap: Record<ProductStatus, ChipColor> = {
  available: "success",
  out_of_stock: "warning",
  discontinued: "danger",
};

export const statusLabelMap: Record<ProductStatus, string> = {
  available: "Available",
  out_of_stock: "Out of Stock",
  discontinued: "Discontinued",
};

export interface ProductsTableContext {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function createProductsColumns(
  context: ProductsTableContext,
): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => (
        <Link
          to="/products/$id"
          params={{ id: info.row.original.id }}
          className="font-medium hover:underline"
        >
          {info.getValue() as string}
        </Link>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      enableSorting: false,
      cell: (info) => (
        <span className="font-mono text-xs text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (info) => (
        <span className="text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: (info) => (
        <span className="tabular-nums">
          ${(info.getValue() as number).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: (info) => (
        <span className="tabular-nums">{info.getValue() as number}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as ProductStatus}
          colorMap={statusColorMap}
          labelMap={statusLabelMap}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const product = info.row.original;
        return (
          <div className="flex justify-end">
            <ActionMenu
              onEdit={() => context.onEdit(product)}
              onDelete={() => context.onDelete(product)}
            />
          </div>
        );
      },
    },
  ];
}
