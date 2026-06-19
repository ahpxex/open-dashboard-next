import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  FormError,
  NumberField,
  SelectField,
  SubmitButton,
  TextField,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/form-fixed")({
  component: FixedFormDemo,
});

const schema = z.object({
  title: z.string().min(1, "Required"),
  amount: z.number().min(0, "Must be ≥ 0"),
  currency: z.enum(["usd", "eur", "gbp"]),
  due: z.string().min(1, "Required"),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = { title: "", amount: 0, currency: "usd", due: "" };
const currencyOptions = [
  { value: "usd", label: "USD" },
  { value: "eur", label: "EUR" },
  { value: "gbp", label: "GBP" },
];

/**
 * Compact / fixed form variant — a short form that fits the viewport with no
 * scrolling, sized to its content. For quick create dialogs surfaced as a page.
 */
function FixedFormDemo() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: EMPTY,
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      toast.success(`Created "${value.title || "invoice"}"`);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Compact form
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A short, fixed-height form sized to its content — no scrolling. Same
          form system + zod.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">New invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <FormError message={serverError} />
            <TextField form={form} name="title" label="Title" required />
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                form={form}
                name="amount"
                label="Amount"
                min={0}
                step="0.01"
                required
              />
              <SelectField
                form={form}
                name="currency"
                label="Currency"
                options={currencyOptions}
              />
            </div>
            <TextField
              form={form}
              name="due"
              type="text"
              label="Due date"
              required
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <SubmitButton form={form}>Create</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
