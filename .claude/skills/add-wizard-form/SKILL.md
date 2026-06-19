---
name: add-wizard-form
description: Add a multi-step wizard / stepper form — fields split across steps with per-step validation, a progress indicator, Back/Next, and a final review + submit. Use for long or onboarding-style flows.
---

# Add a wizard / stepper form

**Canonical example**: `src/routes/_app/gallery/form-wizard.tsx` — one `useForm`
holding all fields + a `useState` step index; only the current step's fields show;
a progress indicator; Next is gated on per-step zod validation
(`schema.shape[name].safeParse`, touch fields via `setFieldMeta` to surface errors);
the last step reviews values via `form.Subscribe` and submits.

## Add one

1. Copy the canonical file; define steps as groups of field names + a step schema.
2. Validate the current step before advancing; submit only on the last step.
3. Add a sidebar entry (or use as a create flow).

## Invariants

- One `useForm` for the whole wizard; steps are a view over its fields.
- Per-step validation gates Next; the final submit goes through the coercing schema.
- Report via `toast` (gallery) or a `Repository` mutation (real).

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — Next is blocked on an
invalid step; review shows the entered values; submit works.
