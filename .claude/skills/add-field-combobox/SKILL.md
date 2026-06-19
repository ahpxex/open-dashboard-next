---
name: add-field-combobox
description: Add a searchable single-select (combobox) form field — a popover with a filter input over options, bound to the form system. Use when a plain select has too many options or needs search/async loading. Ships a copy-ready template.
---

# Add a searchable select (combobox) field

`ComboboxField` is a reusable bound field — a Popover + inline filter Input + option
list, wrapped in `FormField` for label/error, with the same contract as
`TextField`/`SelectField`. Both the field and an example form using it are **bundled**
under `templates/` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-field-combobox/templates/ComboboxField.tsx src/components/form/ComboboxField.tsx
cp .claude/skills/add-field-combobox/templates/form-combobox.tsx src/routes/_app/<name>.tsx
```

(Copy only `ComboboxField.tsx` if you just want the field; copy the route too for a
worked example.) Then:
1. In the route, set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Use the field like any other: `<ComboboxField form={form} name="country" label="Country"
   options={opts} />` (import from `@/components/form/ComboboxField`). Replace the
   demo `countryOptions`/`schema` with yours.
3. Async options: fetch + debounce on the filter input (mirror `useDebouncedSearch`)
   and feed `options` from the query.

(Only open a template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/form` (`AnyForm`, `FormField`, `SelectOption`), `@/components/ui/button`,
`@/components/ui/popover`, `@/lib/utils` (`cn`), `@phosphor-icons/react`
(`CaretDown`/`Check`/`MagnifyingGlass`); the example route also uses `useForm`, `zod`,
`@/components/ui/card`, and `@/lib/toast` — all provided by the base.

## Invariants

- Same field contract as `TextField`/`SelectField` (`form` + `name` + label/error via
  `FormField`); selecting sets the value and closes the popover.
- Keyboard accessible (the Popover + list handle focus).

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — type to filter, pick an
option, and confirm the form value updates.
