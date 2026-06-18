import { PlusIcon } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/db/schema";
import { createProductsColumns } from "@/features/products/columns";
import {
  productsFilters,
  productsTableConfig,
} from "@/features/products/config";
import {
  productsListQuery,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "@/features/products/queries";
import {
  type ProductInput,
  type ProductListParams,
  productStatuses,
} from "@/features/products/schema";
import { DataTable } from "@/infra/table";

const DEFAULT_PARAMS: ProductListParams = {
  page: 1,
  pageSize: productsTableConfig.defaultPageSize,
  search: "",
  status: "",
  sortBy: undefined,
  sortDir: undefined,
};

export const Route = createFileRoute("/_app/products")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(productsListQuery(DEFAULT_PARAMS)),
  component: ProductsPage,
});

type DialogState = { mode: "create" | "edit"; product?: Product } | null;

function ProductsPage() {
  const [page, setPage] = useState(DEFAULT_PARAMS.page);
  const [pageSize, setPageSize] = useState(DEFAULT_PARAMS.pageSize);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dialog, setDialog] = useState<DialogState>(null);

  const params: ProductListParams = {
    page,
    pageSize,
    search,
    status,
    sortBy: sorting[0]?.id,
    sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
  };

  const query = useQuery({
    ...productsListQuery(params),
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
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={productsTableConfig.searchPlaceholder}
        filters={productsFilters}
        filterValues={{ status }}
        onFilterChange={(key, value) => {
          if (key === "status") {
            setStatus(value);
            setPage(1);
          }
        }}
        onRefresh={() => query.refetch()}
        sorting={sorting}
        onSortingChange={(updater) => {
          setSorting(updater);
          setPage(1);
        }}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={productsTableConfig.pageSizeOptions}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
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

const EMPTY_FORM: ProductInput = {
  name: "",
  sku: "",
  category: "",
  price: 0,
  stock: 0,
  status: "available",
  description: "",
};

function toForm(product?: Product): ProductInput {
  if (!product) return { ...EMPTY_FORM };
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    price: product.price,
    stock: product.stock,
    status: product.status as ProductInput["status"],
    description: product.description ?? "",
  };
}

function ProductFormDialog({
  open,
  mode,
  product,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  product?: Product;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const [form, setForm] = useState<ProductInput>(() => toForm(product));
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on each open
  useEffect(() => {
    if (open) {
      setForm(toForm(product));
      setError(null);
    }
  }, [open, product]);

  const pending = create.isPending || update.isPending;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const payload: ProductInput = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };
      if (mode === "edit" && product) {
        await update.mutateAsync({ id: product.id, ...payload });
      } else {
        await create.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit product" : "New product"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the product details below."
              : "Add a new product to your catalogue."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                required
                value={String(form.price)}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value as never })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                required
                value={String(form.stock)}
                onChange={(e) =>
                  setForm({ ...form, stock: e.target.value as never })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm({ ...form, status: value as ProductInput["status"] })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
