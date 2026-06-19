import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { z } from "zod";
import { FormError, SelectField, TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/form-actions")({
  component: FormActionsDemo,
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["active", "paused", "archived"]),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = { name: "", status: "active" };

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

type ButtonVariant = "default" | "outline";

const actions: Array<{ key: string; label: string; variant: ButtonVariant }> = [
  { key: "save", label: "Save", variant: "default" },
  { key: "draft", label: "Save as draft", variant: "outline" },
  { key: "saveNew", label: "Save & new", variant: "outline" },
];

const ACTION_LABELS: Record<string, string> = {
  save: "Saved",
  draft: "Saved (draft)",
  saveNew: "Saved & started a new one",
};

/**
 * Configurable footer actions — a single form with several submit buttons.
 * Each button records which action triggered the submit; the handler branches
 * on that to report the right outcome (and resets on "Save & new").
 */
function FormActionsDemo() {
  const pendingAction = useRef<string>("save");

  const form = useForm({
    defaultValues: EMPTY,
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      const action = pendingAction.current;
      toast.success(`${ACTION_LABELS[action]}: ${value.name}`);
      if (action === "saveNew") {
        form.reset();
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Custom action buttons
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          One form, several configurable submit actions. Each footer button
          records its key before submitting, so the same handler can branch on
          which action the user chose.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex max-w-2xl flex-col gap-6"
      >
        <FormError message={null} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TextField form={form} name="name" label="Name" required />
            <SelectField
              form={form}
              name="status"
              label="Status"
              options={statusOptions}
            />
          </CardContent>
        </Card>

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <div className="flex justify-end gap-2">
              {actions.map((action) => (
                <Button
                  key={action.key}
                  type="submit"
                  variant={action.variant}
                  disabled={!canSubmit || isSubmitting}
                  onClick={() => {
                    pendingAction.current = action.key;
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
