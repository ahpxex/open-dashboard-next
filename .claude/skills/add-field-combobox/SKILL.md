---
name: add-field-combobox
description: Add a searchable single-select (combobox) form field — a popover with a filter input over options, bound to the form system. Use when a plain select has too many options or needs search/async loading.
---

# Add a searchable select (combobox) field

**Canonical example**: `src/components/form/ComboboxField.tsx` (the reusable bound
field — Popover + filter Input + option list, wrapped in `FormField` for
label/error) and `src/routes/_app/gallery/form-combobox.tsx` (a form using it).

## Add one

1. Use `ComboboxField` like the other form fields:
   `<ComboboxField form={form} name="country" label="Country" options={opts} />`
   (import from `@/components/form/ComboboxField`).
2. For async options, fetch + debounce on the filter input (mirror
   `useDebouncedSearch`) and feed `options` from the query.

## Invariants

- Same field contract as `TextField`/`SelectField` (`form` + `name` + label/error
  via `FormField`); selecting sets the value and closes.
- Keyboard accessible (the Popover + list handle focus).

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — type to filter, pick an
option, and confirm the form value updates.
