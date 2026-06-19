import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  FormError,
  SelectField,
  SubmitButton,
  TextField,
} from "@/components/form";
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
import { errorMessage } from "@/lib/toast";
import {
  useCreateLeaveRequest,
  useDeleteLeaveRequest,
  useUpdateLeaveRequest,
} from "./queries";
import {
  type LeaveInput,
  type LeaveRequest,
  leaveInputSchema,
  leaveStatuses,
  leaveTypes,
} from "./schema";

const typeOptions = leaveTypes.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const statusOptions = leaveStatuses.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export function LeaveFormDialog({
  open,
  mode,
  leave,
  defaultDate,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  leave?: LeaveRequest;
  defaultDate: string;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit leave" : "Request leave"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update or remove this time off."
              : "Add time off to the team calendar."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <LeaveForm
            key={leave?.id ?? defaultDate ?? "new"}
            mode={mode}
            leave={leave}
            defaultDate={defaultDate}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function LeaveForm({
  mode,
  leave,
  defaultDate,
  onDone,
}: {
  mode: "create" | "edit";
  leave?: LeaveRequest;
  defaultDate: string;
  onDone: () => void;
}) {
  const create = useCreateLeaveRequest();
  const update = useUpdateLeaveRequest();
  const remove = useDeleteLeaveRequest();
  const confirm = useConfirm();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      employee: leave?.employee ?? "",
      type: leave?.type ?? "vacation",
      date: leave?.date ?? defaultDate,
      status: leave?.status ?? "pending",
    } as LeaveInput,
    validators: { onChange: leaveInputSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = leaveInputSchema.parse(value);
      try {
        if (mode === "edit" && leave) {
          await update.mutateAsync({ id: leave.id, ...payload });
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

      <TextField form={form} name="employee" label="Employee" required />

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          form={form}
          name="type"
          label="Type"
          options={typeOptions}
        />
        <SelectField
          form={form}
          name="status"
          label="Status"
          options={statusOptions}
        />
      </div>

      <TextField
        form={form}
        name="date"
        label="Date"
        placeholder="2026-06-15"
        required
      />

      <DialogFooter className="items-center sm:justify-between">
        {mode === "edit" && leave ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={async () => {
              const ok = await confirm({
                title: "Delete this leave?",
                description: `${leave.employee} · ${leave.date}`,
                confirmLabel: "Delete",
                destructive: true,
              });
              if (ok) {
                remove.mutate(leave.id);
                onDone();
              }
            }}
          >
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <SubmitButton form={form}>Save</SubmitButton>
        </div>
      </DialogFooter>
    </form>
  );
}
