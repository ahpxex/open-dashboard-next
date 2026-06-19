import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  FormError,
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/form-scroll")({
  component: ScrollFormDemo,
});

const schema = z.object({
  legalName: z.string().min(1, "Required"),
  displayName: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string(),
  website: z.string(),
  street: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  region: z.string(),
  postcode: z.string(),
  country: z.enum(["us", "gb", "de", "cn", "jp"]),
  taxId: z.string(),
  industry: z.string(),
  size: z.enum(["1-10", "11-50", "51-200", "200+"]),
  notes: z.string(),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = {
  legalName: "",
  displayName: "",
  email: "",
  phone: "",
  website: "",
  street: "",
  city: "",
  region: "",
  postcode: "",
  country: "us",
  taxId: "",
  industry: "",
  size: "1-10",
  notes: "",
};

const countryOptions = [
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },
  { value: "de", label: "Germany" },
  { value: "cn", label: "China" },
  { value: "jp", label: "Japan" },
];
const sizeOptions = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "200+", label: "200+" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-b border-border pb-6 last:border-b-0">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Scrollable long form variant — sticky header + sticky footer action bar with a
 * scrolling body, for forms too tall for one screen. Same form system + zod.
 */
function ScrollFormDemo() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: EMPTY,
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      toast.success(`Saved ${value.displayName || "organisation"}`);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="mx-auto flex h-[calc(100vh-7rem)] max-w-2xl flex-col overflow-hidden border border-border bg-card"
    >
      <header className="shrink-0 border-b border-border px-6 py-4">
        <h1 className="font-heading text-lg font-semibold tracking-tight">
          Organisation details
        </h1>
        <p className="text-sm text-muted-foreground">
          Scrollable long form — header and actions stay pinned while the body
          scrolls.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <FormError message={serverError} />
        <div className="flex flex-col gap-6">
          <Section title="Identity">
            <TextField
              form={form}
              name="legalName"
              label="Legal name"
              required
            />
            <TextField
              form={form}
              name="displayName"
              label="Display name"
              required
            />
          </Section>
          <Section title="Contact">
            <div className="grid grid-cols-2 gap-3">
              <TextField
                form={form}
                name="email"
                type="email"
                label="Email"
                required
              />
              <TextField form={form} name="phone" label="Phone" />
            </div>
            <TextField form={form} name="website" label="Website" />
          </Section>
          <Section title="Address">
            <TextField form={form} name="street" label="Street" required />
            <div className="grid grid-cols-2 gap-3">
              <TextField form={form} name="city" label="City" required />
              <TextField form={form} name="region" label="State / Region" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField form={form} name="postcode" label="Postcode" />
              <SelectField
                form={form}
                name="country"
                label="Country"
                options={countryOptions}
              />
            </div>
          </Section>
          <Section title="Business">
            <div className="grid grid-cols-2 gap-3">
              <TextField form={form} name="taxId" label="Tax ID" />
              <TextField form={form} name="industry" label="Industry" />
            </div>
            <SelectField
              form={form}
              name="size"
              label="Company size"
              options={sizeOptions}
            />
            <TextareaField form={form} name="notes" label="Notes" rows={3} />
          </Section>
        </div>
      </div>

      <footer className="flex shrink-0 justify-end gap-2 border-t border-border px-6 py-3">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <SubmitButton form={form}>Save organisation</SubmitButton>
      </footer>
    </form>
  );
}
