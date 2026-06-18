---
name: add-form
description: Build a validated form (create/edit dialog or full-page) with TanStack Form + zod and the bound field components. Use whenever you need user input with validation and server-error handling.
---

# Add a form

Canonical example: `src/features/products/ProductFormDialog.tsx`. Built on
`@/components/form` (TanStack Form + zod).

## Pattern

```tsx
const form = useForm({
  defaultValues: toForm(record),            // values match the form schema's types
  validators: { onChange: <name>FormSchema }, // non-coercing zod (input === value type)
  onSubmit: async ({ value }) => {
    setServerError(null);
    const payload = <name>InputSchema.parse(value); // coercing parse on submit
    try { await mutateAsync(payload); onDone(); }
    catch (err) { setServerError(errorMessage(err)); }
  },
});
```

Render with the bound fields (they wire label + error + value to the form):

```tsx
<form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
  <FormError message={serverError} />
  <TextField form={form} name="name" label="Name" required />
  <NumberField form={form} name="price" label="Price" min={0} step="0.01" required />
  <SelectField form={form} name="status" label="Status" options={statusOptions} />
  <TextareaField form={form} name="description" label="Description" />
  <SubmitButton form={form}>Save</SubmitButton>
</form>
```

In a dialog, render the `<…Form>` with `key={record?.id ?? "new"}` so it
remounts (clean reset) each time the dialog opens.

## Invariants

- Two schemas: a **non-coercing** `*FormSchema` for `validators.onChange` (its
  input types must equal the form values) and a **coercing** `*InputSchema` for
  the server (defends against string inputs). `NumberField` emits `undefined`
  when empty.
- `SubmitButton` is disabled while invalid or submitting (handled for you).
- Server errors surface via `<FormError>`; field validation shows under each
  field once touched.

## Verify

`bun run typecheck && bun run check && bun run test`. Submit empty → field errors
+ disabled submit; fill valid → submits.
