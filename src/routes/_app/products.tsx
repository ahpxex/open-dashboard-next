import { PlusIcon } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { Product } from "@/db/schema";
import { createProductsColumns } from "@/features/products/columns";
import {
  productsFilters,
  productsTableConfig,
} from "@/features/products/config";
import { ProductFormDialog } from "@/features/products/ProductFormDialog";
import {
  productsListQuery,
  useDeleteProduct,
} from "@/features/products/queries";
import { productListParamsSchema } from "@/features/products/schema";
import { DataTable, useTableSearch } from "@/infra/table";

export const Route = createFileRoute("/_app/products")({
  validateSearch: productListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(productsListQuery(deps)),
  component: ProductsPage,
});

type DialogState = { mode: "create" | "edit"; product?: Product } | null;

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const table = useTableSearch(search, navigate);
  const [dialog, setDialog] = useState<DialogState>(null);

  const query = useQuery({
    ...productsListQuery(search),
    placeholderData: keepPreviousData,
  });

  const deleteProduct = useDeleteProduct();
  const confirm = useConfirm();

  const columns = useMemo(
    () =>
      createProductsColumns({
        onEdit: (product) => setDialog({ mode: "edit", product }),
        onDelete: async (product) => {
          const ok = await confirm({
            title: `Delete “${product.name}”?`,
            description: "This action cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
          });
          if (ok) deleteProduct.mutate(product.id);
        },
      }),
    [deleteProduct, confirm],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">
            A full CRUD resource backed by Postgres — copy this folder to build
            your own.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.rows ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isLoading || query.isFetching}
        searchValue={search.search}
        onSearchChange={table.setSearch}
        searchPlaceholder={productsTableConfig.searchPlaceholder}
        filters={productsFilters}
        filterValues={{ status: search.status }}
        onFilterChange={table.setFilter}
        onRefresh={() => query.refetch()}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        page={search.page}
        pageSize={search.pageSize}
        pageSizeOptions={productsTableConfig.pageSizeOptions}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyMessage={productsTableConfig.emptyMessage}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add product
          </Button>
        }
      />

      <ProductFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        product={dialog?.product}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
