import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  FormError,
  NumberField,
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/db/schema";
import { errorMessage } from "@/lib/toast";
import { useCreateProduct, useUpdateProduct } from "./queries";
import {
  type ProductInput,
  productFormSchema,
  productInputSchema,
  productStatuses,
} from "./schema";

const EMPTY_FORM: ProductInput = {
  name: "",
  sku: "",
  category: "",
  price: 0,
  stock: 0,
  status: "available",
  description: "",
};

const statusOptions = productStatuses.map((value) => ({
  value,
  label: value.replace(/_/g, " "),
}));

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

/**
 * Create/edit dialog for a product, shared by the list and detail pages. Keyed
 * remount resets the form per open; zod validates on change; the coercing schema
 * parses on submit.
 */
export function ProductFormDialog({
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

        {open ? (
          <ProductForm
            key={product?.id ?? "new"}
            mode={mode}
            product={product}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ProductForm({
  mode,
  product,
  onDone,
}: {
  mode: "create" | "edit";
  product?: Product;
  onDone: () => void;
}) {
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(product),
    validators: { onChange: productFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = productInputSchema.parse(value);
      try {
        if (mode === "edit" && product) {
          await update.mutateAsync({ id: product.id, ...payload });
        } else {
          await create.mutateAsync(payload);
        }
        onDone();
      } catch (err) {
        setServerError(errorMessage(err));
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <FormError message={serverError} />

      <TextField form={form} name="name" label="Name" required />

      <div className="grid grid-cols-2 gap-3">
        <TextField form={form} name="sku" label="SKU" required />
        <TextField form={form} name="category" label="Category" required />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <NumberField
          form={form}
          name="price"
          label="Price"
          min={0}
          step="0.01"
          required
        />
        <NumberField form={form} name="stock" label="Stock" min={0} required />
        <SelectField
          form={form}
          name="status"
          label="Status"
          options={statusOptions}
        />
      </div>

      <TextareaField
        form={form}
        name="description"
        label="Description"
        rows={3}
      />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <SubmitButton form={form}>Save</SubmitButton>
      </DialogFooter>
    </form>
  );
}
