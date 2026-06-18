"use client";

import { Plus, Sparkle } from "@phosphor-icons/react";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  createProductsConfig,
  generateProducts,
  type Product,
  productsHandlers,
  productsMeta,
} from "@/examples/products";
import {
  PaginationTable,
  type PaginationTableRef,
  TablePage,
} from "@/infra/table";

type ProductFormData = Omit<Product, "id" | "createdAt">;

export default function ActionsPage() {
  const tableRef = useRef<PaginationTableRef>(null);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    status: "available",
    description: "",
    sku: "",
  });

  const handleAddNew = useCallback(() => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "",
      price: 0,
      stock: 0,
      status: "available",
      description: "",
      sku: "",
    });
    setOpen(true);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
      description: product.description,
      sku: product.sku,
    });
    setOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await productsHandlers.deleteOne?.(id);
      tableRef.current?.refresh();
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (editingProduct) {
      await productsHandlers.update?.(editingProduct.id, formData);
    } else {
      await productsHandlers.create?.(formData);
    }
    setOpen(false);
    tableRef.current?.refresh();
  }, [editingProduct, formData]);

  const handleFormChange = useCallback(
    (field: keyof ProductFormData, value: string | number) => {
      setFormData((previous) => ({ ...previous, [field]: value }));
    },
    [],
  );

  const handleGenerateSamples = useCallback(() => {
    // Generate and save sample products via localStorage
    const products = generateProducts(50);
    const existing = JSON.parse(
      localStorage.getItem("example-products") || "[]",
    );
    localStorage.setItem(
      "example-products",
      JSON.stringify([...products, ...existing]),
    );
    tableRef.current?.refresh();
  }, []);

  const [totalCount, setTotalCount] = useState(0);
  const config = useMemo(
    () =>
      createProductsConfig({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleDelete, handleEdit],
  );

  return (
    <TablePage
      title={productsMeta.title}
      description={
        <>
          {productsMeta.description ? `${productsMeta.description} ` : ""}
          Total products: {totalCount}
        </>
      }
      actions={
        <>
          <Button variant="secondary" onClick={handleGenerateSamples}>
            <Sparkle size={20} weight="fill" />
            Generate Samples
          </Button>
          <Button onClick={handleAddNew}>
            <Plus size={20} weight="bold" />
            Add Product
          </Button>
        </>
      }
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        }
      >
        <PaginationTable
          ref={tableRef}
          {...config}
          onTotalsChange={({ totalCount }) => setTotalCount(totalCount)}
        />
      </Suspense>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Field label="Product Name" required>
              <Input
                placeholder="Enter product name"
                value={formData.name}
                onChange={(event) =>
                  handleFormChange("name", event.target.value)
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SKU" required>
                <Input
                  placeholder="Enter SKU"
                  value={formData.sku}
                  onChange={(event) =>
                    handleFormChange("sku", event.target.value)
                  }
                />
              </Field>
              <Field label="Category" required>
                <Input
                  placeholder="Enter category"
                  value={formData.category}
                  onChange={(event) =>
                    handleFormChange("category", event.target.value)
                  }
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price" required>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-6"
                    value={formData.price.toString()}
                    onChange={(event) =>
                      handleFormChange(
                        "price",
                        Number.parseFloat(event.target.value) || 0,
                      )
                    }
                  />
                </div>
              </Field>
              <Field label="Stock" required>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.stock.toString()}
                  onChange={(event) =>
                    handleFormChange(
                      "stock",
                      Number.parseInt(event.target.value, 10) || 0,
                    )
                  }
                />
              </Field>
            </div>
            <Field label="Status" required>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleFormChange("status", value as string)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Description">
              <Input
                placeholder="Enter product description"
                value={formData.description}
                onChange={(event) =>
                  handleFormChange("description", event.target.value)
                }
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingProduct ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TablePage>
  );
}
