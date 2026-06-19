import { CheckIcon } from "@phosphor-icons/react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/gallery/form-wizard")({
  component: FormWizardDemo,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  fullName: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  role: z.enum(["owner", "admin", "member"]),
  notes: z.string(),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = {
  email: "",
  password: "",
  fullName: "",
  company: "",
  role: "member",
  notes: "",
};

const roleOptions = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

const STEPS = [
  { title: "Account", fields: ["email", "password"] as const },
  { title: "Profile", fields: ["fullName", "company", "role"] as const },
  { title: "Review", fields: [] as const },
];

/**
 * Multi-step (wizard) form. A single `useForm` holds every field; a local step
 * index drives which fields render. Advancing is gated on the current step's
 * fields being valid; the final step shows a review summary before submit.
 */
function FormWizardDemo() {
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: EMPTY,
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      toast.success(`Account created for ${value.fullName}`);
    },
  });

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function stepIsValid(index: number) {
    const fields = STEPS[index].fields;
    return fields.every((name) => {
      const value = form.getFieldValue(name);
      const result = schema.shape[name].safeParse(value);
      return result.success;
    });
  }

  function next() {
    if (!stepIsValid(step)) {
      // Touch the step's fields so validation errors surface.
      for (const name of current.fields) {
        form.setFieldMeta(name, (meta) => ({ ...meta, isTouched: true }));
      }
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Wizard / stepper form
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A multi-step form backed by one TanStack Form. Each step validates its
          own fields before you can advance; the last step reviews the payload.
        </p>
      </div>

      <ol className="flex max-w-2xl items-center gap-2">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s.title} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-none border text-xs font-medium",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary text-primary",
                    !done && !active && "border-border text-muted-foreground",
                  )}
                >
                  {done ? <CheckIcon className="size-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 ? <Separator className="flex-1" /> : null}
            </li>
          );
        })}
      </ol>

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
            <CardTitle className="text-base">
              Step {step + 1} of {STEPS.length} · {current.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {step === 0 ? (
              <>
                <TextField
                  form={form}
                  name="email"
                  type="email"
                  label="Email"
                  required
                />
                <TextField
                  form={form}
                  name="password"
                  type="password"
                  label="Password"
                  required
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <TextField
                  form={form}
                  name="fullName"
                  label="Full name"
                  required
                />
                <TextField
                  form={form}
                  name="company"
                  label="Company"
                  required
                />
                <SelectField
                  form={form}
                  name="role"
                  label="Role"
                  options={roleOptions}
                />
              </>
            ) : null}

            {step === 2 ? (
              <form.Subscribe selector={(state) => state.values}>
                {(values) => (
                  <div className="flex flex-col gap-4">
                    <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="font-medium">{values.email}</dd>
                      <dt className="text-muted-foreground">Password</dt>
                      <dd className="font-medium">
                        {"•".repeat(values.password.length)}
                      </dd>
                      <dt className="text-muted-foreground">Full name</dt>
                      <dd className="font-medium">{values.fullName}</dd>
                      <dt className="text-muted-foreground">Company</dt>
                      <dd className="font-medium">{values.company}</dd>
                      <dt className="text-muted-foreground">Role</dt>
                      <dd className="font-medium capitalize">{values.role}</dd>
                    </dl>
                    <TextareaField
                      form={form}
                      name="notes"
                      label="Notes (optional)"
                      rows={3}
                    />
                  </div>
                )}
              </form.Subscribe>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
          >
            Back
          </Button>
          {isLast ? (
            <SubmitButton form={form}>Create account</SubmitButton>
          ) : (
            <Button type="button" onClick={next}>
              Next
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
