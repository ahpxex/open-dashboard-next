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
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/form-page")({
  component: FormPageDemo,
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(["admin", "member", "viewer"]),
  team: z.string().min(1, "Team is required"),
  bio: z.string(),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = {
  name: "",
  email: "",
  role: "member",
  team: "",
  bio: "",
};
const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

/**
 * Full-page form variant — the same form system as the dialog, on its own route.
 * Gallery demo: validates with zod, has a server-error slot, and reports the
 * payload via a toast instead of persisting.
 */
function FormPageDemo() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: EMPTY,
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      toast.success(`Saved ${value.name || "member"}`);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Full-page form
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A validated form on its own route (vs the create/edit dialog).
          TanStack Form + zod, server-error slot, submit disabled while invalid.
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
            <CardTitle className="text-base">Team member</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TextField form={form} name="name" label="Name" required />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                form={form}
                name="email"
                type="email"
                label="Email"
                required
              />
              <TextField form={form} name="team" label="Team" required />
            </div>
            <SelectField
              form={form}
              name="role"
              label="Role"
              options={roleOptions}
            />
            <TextareaField form={form} name="bio" label="Bio" rows={4} />
          </CardContent>
        </Card>

        <div className="flex max-w-2xl justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <SubmitButton form={form}>Save</SubmitButton>
        </div>
      </form>
    </div>
  );
}
