---
name: add-wizard-form
description: Add a multi-step wizard / stepper form — fields split across steps with per-step validation, a progress indicator, Back/Next, and a final review + submit. Use for long or onboarding-style flows. Ships a copy-ready template.
---

# Add a wizard / stepper form

One `useForm` holds all fields plus a `useState` step index; only the current step's
fields render. A progress indicator tracks steps, Next is gated on per-step zod
validation (`schema.shape[name].safeParse`, fields touched via `setFieldMeta` so
errors surface), and the last step reviews values via `form.Subscribe` before submit.
The page is **bundled** under `templates/` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-wizard-form/templates/form-wizard.tsx src/routes/_app/<name>.tsx
```

Then in the copied file:
1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Replace `schema`/`EMPTY` with your fields; define `STEPS` as groups of field names
   (last step has empty `fields` for review). Render each step's fields in the
   `step === n` blocks.
3. Real resource: in `onSubmit`, call a `Repository`/mutation hook (toast on success,
   surface the message via `setServerError` on failure) instead of only toasting.

(Only open the template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/form` (`TextField`/`SelectField`/`TextareaField`/`SubmitButton`/`FormError`),
`@tanstack/react-form` (`useForm`), `@/components/ui/{button,card,separator}`,
`@/lib/toast`, `@/lib/utils` (`cn`), `@phosphor-icons/react`, `zod`, the page-shell
heading, and theme tokens — all provided by the base.

## Invariants

- One `useForm` for the whole wizard; steps are a view over its fields.
- Per-step validation gates Next. The demo validates and submits through one
  non-coercing `schema`; when wiring a **real resource**, route the final submit
  through that resource's coercing `*InputSchema` before the mutation.
- Report via `toast` (demo) or a `Repository` mutation (real).

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — Next is blocked on an
invalid step; review shows the entered values; submit works.
