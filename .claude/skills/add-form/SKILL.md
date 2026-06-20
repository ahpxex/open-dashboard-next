---
name: add-form
description: Build a validated form (create/edit dialog or full-page) with TanStack Form + zod and the bound field components. Use whenever you need user input with validation and server-error handling. Ships copy-ready templates.
---

# Add a form

A validated form built on `@/components/form` (TanStack Form + zod) with bound
fields, a server-error slot, and a submit disabled while invalid. Five full-page
variants are **bundled** under `templates/` — copy the one that fits, don't paste
code from here. (Four are form-system forms; `form-array.tsx` is the exception —
a local-state array pattern, not on TanStack Form. See the variant note below.)

Pick a variant:

- `form-page.tsx` — **full-page form** on its own route (the page counterpart of
  the create/edit dialog). The default starting point.
- `form-scroll.tsx` — **long scrollable form**: sticky header + sticky footer
  action bar with a scrolling body, split into sections. For forms too tall for
  one screen.
- `form-fixed.tsx` — **compact form**: short, fixed-height, sized to its content
  with no scrolling. For quick create flows surfaced as a page.
- `form-array.tsx` — **field array**: a repeatable list of rows (add/remove,
  edit in place, live computed total). For variable-length inputs like line items.
  This one is intentionally a **local-state** array pattern (rows in `useState`,
  validate on submit) — it is *not* built on the form system / TanStack Form.
- `form-actions.tsx` — **multiple submit actions**: one form, several footer
  buttons (Save / Save as draft / Save & new) that branch the same handler.

## Add one

```bash
cp .claude/skills/add-form/templates/form-page.tsx src/routes/_app/<name>.tsx
```

(Swap `form-page.tsx` for `form-scroll.tsx`, `form-fixed.tsx`, `form-array.tsx`,
or `form-actions.tsx` per the list above.)

Then in the copied file:
1. Set the `createFileRoute("/_app/<name>")` path to match the file path (the
   templates point at `/_app/gallery/...`).
2. Replace the demo `schema` / `Values` / `EMPTY` and the rendered fields with
   your own. Keep the field components (`TextField`/`NumberField`/`SelectField`/
   `TextareaField`) and the `FormError` + `SubmitButton` wiring.
3. Real resource: the templates report the payload via a `toast` instead of
   persisting. Swap `onSubmit` to parse with the resource's coercing
   `*InputSchema` and call its `useCreate*`/`useUpdate*` mutation
   (`await mutateAsync(payload)`), surfacing failures through `setServerError`.
   In a dialog, render the `<…Form>` with `key={record?.id ?? "new"}` so it
   remounts (clean reset) each time it opens.

A real resource form also needs a matching `features/<name>/` resource
(`schema.ts`/`server.ts`/`queries.ts`) — `add-crud-resource` / `create-resource`
scaffolds it.

(Only open a template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/form` (`FormError`, `TextField`, `NumberField`, `SelectField`,
`TextareaField`, `SubmitButton`), `@/components/ui/{button,card,input,label}`,
`@/lib/toast`, `@tanstack/react-form` (`useForm`), `@phosphor-icons/react`, the
page-shell heading, and theme tokens (`text-muted-foreground`, `border-border`,
`bg-card`) — all provided by the base.

## Invariants

- When wiring a **real resource**, split the schema in two: a **non-coercing**
  `*FormSchema` for `validators.onChange` (its input types must equal the form
  values) and a **coercing** `*InputSchema` for the server (defends against string
  inputs) — see `features/products/schema.ts`. The page demos here skip this and
  validate with one inline `schema`; only the resource's `server.ts` boundary
  needs the coercing variant. `NumberField` emits `undefined` when empty.
- `SubmitButton` is disabled while invalid or submitting (handled for you).
- Server errors surface via `<FormError>`; field validation shows under each
  field once touched.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — submit empty → field
errors + disabled submit; fill valid → submits.
