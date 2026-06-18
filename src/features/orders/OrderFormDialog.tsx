import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  FormError,
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
import type { Order } from "@/db/schema";
import { errorMessage } from "@/lib/toast";
import { useCreateOrder, useUpdateOrder } from "./queries";
import {
  type OrderInput,
  ordersFormSchema,
  ordersInputSchema,
  ordersStatuses,
} from "./schema";

const EMPTY_FORM: OrderInput = { name: "", status: "active", description: "" };

const statusOptions = ordersStatuses.map((value) => ({ value, label: value }));

function toForm(row?: Order): OrderInput {
  if (!row) return { ...EMPTY_FORM };
  return {
    name: row.name,
    status: row.status as OrderInput["status"],
    description: row.description ?? "",
  };
}

/** Create/edit dialog for an order, shared by the list and detail panel. */
export function OrderFormDialog({
  open,
  mode,
  row,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  row?: Order;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit order" : "New order"}
          </DialogTitle>
          <DialogDescription>Fill in the details below.</DialogDescription>
        </DialogHeader>

        {open ? (
          <OrderForm
            key={row?.id ?? "new"}
            mode={mode}
            row={row}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function OrderForm({
  mode,
  row,
  onDone,
}: {
  mode: "create" | "edit";
  row?: Order;
  onDone: () => void;
}) {
  const create = useCreateOrder();
  const update = useUpdateOrder();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(row),
    validators: { onChange: ordersFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = ordersInputSchema.parse(value);
      try {
        if (mode === "edit" && row) {
          await update.mutateAsync({ id: row.id, ...payload });
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

      <SelectField
        form={form}
        name="status"
        label="Status"
        options={statusOptions}
      />

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
