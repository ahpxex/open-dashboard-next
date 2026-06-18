"use client";

import {
  ArrowClockwise,
  PencilSimple,
  Plus,
  Sparkle,
} from "@phosphor-icons/react";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { FloatingActionMenu } from "@/components/FloatingActionMenu";
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
  generateSelectableProducts,
  type SelectableProduct,
  selectablesConfig,
  selectablesHandlers,
  selectablesMeta,
} from "@/examples/selectables";
import {
  PaginationTable,
  type PaginationTableRef,
  type SelectionChangePayload,
  TablePage,
} from "@/infra/table";

type ProductFormData = Omit<SelectableProduct, "id" | "lastRestocked">;

export default function SelectablesPage() {
  const tableRef = useRef<PaginationTableRef>(null);
  const [open, setOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [editingProduct, setEditingProduct] =
    useState<SelectableProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    category: "",
    price: 0,
    stock: 0,
    status: "active",
    supplier: "",
  });

  const handleAddNew = useCallback(() => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: "",
      category: "",
      price: 0,
      stock: 0,
      status: "active",
      supplier: "",
    });
    setOpen(true);
  }, []);

  const handleEdit = useCallback((product: SelectableProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
      supplier: product.supplier,
    });
    setOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (editingProduct) {
      await selectablesHandlers.update?.(editingProduct.id, formData);
    } else {
      await selectablesHandlers.create?.(formData);
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
    const products = generateSelectableProducts(50);
    const existing = JSON.parse(
      localStorage.getItem("example-selectables") || "[]",
    );
    localStorage.setItem(
      "example-selectables",
      JSON.stringify([...products, ...existing]),
    );
    tableRef.current?.refresh();
  }, []);

  const handleClearSelection = useCallback(() => {
    tableRef.current?.clearSelection();
  }, []);

  const handleRefresh = useCallback(() => {
    tableRef.current?.refresh();
  }, []);

  const handleSelectionChange = useCallback(
    (payload: SelectionChangePayload<SelectableProduct>) => {
      setSelectedIds(payload.ids);
      setSelectedCount(payload.ids.length);
    },
    [],
  );

  const handleEditSelected = useCallback(
    async (id: string) => {
      const result = await selectablesHandlers.getOne?.(id);
      if (result?.data) {
        handleEdit(result.data);
      }
    },
    [handleEdit],
  );

  const floatingActions = useMemo(
    () => [
      {
        key: "edit-first",
        label: "Edit First",
        icon: <PencilSimple size={16} />,
        color: "primary" as const,
        onClick: () => {
          if (selectedIds.length > 0) {
            handleEditSelected(selectedIds[0]);
          }
        },
      },
      {
        key: "refresh",
        label: "Refresh",
        icon: <ArrowClockwise size={16} />,
        onClick: handleRefresh,
      },
    ],
    [handleEditSelected, handleRefresh, selectedIds],
  );

  return (
    <TablePage
      title={selectablesMeta.title}
      description={
        <>
          {selectablesMeta.description ? `${selectablesMeta.description} ` : ""}
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
      className="relative"
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
          enableSelection
          {...selectablesConfig}
          onTotalsChange={({ totalCount }) => setTotalCount(totalCount)}
          onSelectionChange={handleSelectionChange}
        />
      </Suspense>

      <FloatingActionMenu
        selectedCount={selectedCount}
        onClear={handleClearSelection}
        actions={floatingActions}
      />

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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Supplier">
              <Input
                placeholder="Enter supplier name"
                value={formData.supplier}
                onChange={(event) =>
                  handleFormChange("supplier", event.target.value)
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
