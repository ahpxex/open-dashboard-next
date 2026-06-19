import {
  CaretRightIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { statusColorMap, statusLabelMap } from "@/features/products/columns";
import { ProductFormDialog } from "@/features/products/ProductFormDialog";
import {
  productDetailQuery,
  useDeleteProduct,
} from "@/features/products/queries";
import type { ProductStatus } from "@/features/products/schema";
import { DescriptionList, StatusChip } from "@/infra/ui";

export const Route = createFileRoute("/_app/products_/$id")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(
      productDetailQuery(params.id),
    );
    if (!product) throw notFound();
    return { product };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const deleteProduct = useDeleteProduct();
  const [editing, setEditing] = useState(false);

  const query = useQuery(productDetailQuery(id));
  const product = query.data;

  if (query.isLoading && !product) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Product not found</h1>
        <Link to="/products" className="text-sm underline">
          Back to products
        </Link>
      </div>
    );
  }

  async function onDelete() {
    if (!product) return;
    const ok = await confirm({
      title: `Delete “${product.name}”?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) {
      await deleteProduct.mutateAsync(product.id);
      navigate({ to: "/products" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/products" className="hover:text-foreground hover:underline">
          Products
        </Link>
        <CaretRightIcon size={12} />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <StatusChip
              status={product.status as ProductStatus}
              colorMap={statusColorMap}
              labelMap={statusLabelMap}
            />
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {product.sku}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <PencilSimpleIcon size={16} />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={deleteProduct.isPending}
          >
            <TrashIcon size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="border border-border p-6">
        <DescriptionList
          columns={3}
          items={[
            { label: "Category", value: product.category },
            { label: "Price", value: `$${product.price.toFixed(2)}` },
            { label: "Stock", value: product.stock },
            {
              label: "Status",
              value: (
                <StatusChip
                  status={product.status as ProductStatus}
                  colorMap={statusColorMap}
                  labelMap={statusLabelMap}
                />
              ),
            },
            {
              label: "Created",
              value: new Date(product.createdAt).toLocaleString(),
            },
            {
              label: "Updated",
              value: new Date(product.updatedAt).toLocaleString(),
            },
            {
              label: "Description",
              value: product.description || "—",
              full: true,
            },
          ]}
        />
      </div>

      <ProductFormDialog
        open={editing}
        mode="edit"
        product={product}
        onOpenChange={setEditing}
      />
    </div>
  );
}
