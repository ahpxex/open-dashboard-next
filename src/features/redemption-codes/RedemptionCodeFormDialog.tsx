import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  FormError,
  NumberField,
  SelectField,
  SubmitButton,
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
import { errorMessage } from "@/lib/toast";
import { useCreateRedemptionCode, useUpdateRedemptionCode } from "./queries";
import {
  type RedemptionCode,
  type RedemptionCodeInput,
  redemptionCodeFormSchema,
  redemptionCodeInputSchema,
  redemptionCodeStatuses,
} from "./schema";

const EMPTY_FORM: RedemptionCodeInput = {
  code: "",
  discountPercent: 10,
  maxUses: 100,
  status: "active",
};

const statusOptions = redemptionCodeStatuses.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function toForm(code?: RedemptionCode): RedemptionCodeInput {
  if (!code) return { ...EMPTY_FORM };
  return {
    code: code.code,
    discountPercent: code.discountPercent,
    maxUses: code.maxUses,
    status: code.status,
  };
}

export function RedemptionCodeFormDialog({
  open,
  mode,
  code,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  code?: RedemptionCode;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit code" : "New code"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this redemption code."
              : "Create a redemption code for a campaign."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <CodeForm
            key={code?.id ?? "new"}
            mode={mode}
            code={code}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CodeForm({
  mode,
  code,
  onDone,
}: {
  mode: "create" | "edit";
  code?: RedemptionCode;
  onDone: () => void;
}) {
  const create = useCreateRedemptionCode();
  const update = useUpdateRedemptionCode();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(code),
    validators: { onChange: redemptionCodeFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = redemptionCodeInputSchema.parse(value);
      try {
        if (mode === "edit" && code) {
          await update.mutateAsync({ id: code.id, ...payload });
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

      <TextField
        form={form}
        name="code"
        label="Code"
        placeholder="SUMMER20"
        required
      />

      <div className="grid grid-cols-3 gap-3">
        <NumberField
          form={form}
          name="discountPercent"
          label="Discount %"
          min={0}
          max={100}
          required
        />
        <NumberField
          form={form}
          name="maxUses"
          label="Max uses"
          min={1}
          required
        />
        <SelectField
          form={form}
          name="status"
          label="Status"
          options={statusOptions}
        />
      </div>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <SubmitButton form={form}>Save</SubmitButton>
      </DialogFooter>
    </form>
  );
}
