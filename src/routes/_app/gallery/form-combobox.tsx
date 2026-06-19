import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { FormError, SubmitButton, TextField } from "@/components/form";
import { ComboboxField } from "@/components/form/ComboboxField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/form-combobox")({
  component: FormComboboxDemo,
});

const countryOptions = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cn", label: "China" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "in", label: "India" },
  { value: "id", label: "Indonesia" },
  { value: "it", label: "Italy" },
  { value: "jp", label: "Japan" },
  { value: "mx", label: "Mexico" },
  { value: "nl", label: "Netherlands" },
  { value: "ng", label: "Nigeria" },
  { value: "pl", label: "Poland" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ae", label: "United Arab Emirates" },
  { value: "gb", label: "United Kingdom" },
  { value: "us", label: "United States" },
];

const schema = z.object({
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Pick a country"),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = { city: "", country: "" };

/**
 * Combobox demo — a searchable single-select bound to the form alongside a
 * normal text field. Validates with zod and reports the payload via a toast.
 */
function FormComboboxDemo() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: EMPTY,
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const country = countryOptions.find((c) => c.value === value.country);
      toast.success(`Saved ${value.city}, ${country?.label ?? value.country}`);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Searchable select (combobox)
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A type-to-filter single-select bound to the form system. Useful when a
          plain dropdown has too many options to scan.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex max-w-2xl flex-col gap-6"
      >
        <FormError message={serverError} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TextField form={form} name="city" label="City" required />
            <ComboboxField
              form={form}
              name="country"
              label="Country"
              options={countryOptions}
              placeholder="Select a country"
              required
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <SubmitButton form={form}>Save</SubmitButton>
        </div>
      </form>
    </div>
  );
}
