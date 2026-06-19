---
name: add-empty-state
description: Add a polished empty state — centred icon, headline, description, and primary/secondary CTAs — for first-run, no-data, and filtered-no-results cases. Use so blank screens guide the user instead of looking broken.
---

# Add an empty state

**Canonical example**: `src/routes/_app/gallery/empty-state.tsx` — a centred icon
in a muted circle, headline, muted description, primary CTA + secondary action, and
a toggle previewing the "filtered, no results" variant.

## Add one

1. Copy the canonical file (or the `StateView` `empty` state from
   `add-feedback-states`) and set the icon/copy/CTAs.
2. Use it wherever a list/page can be empty — distinguish "no data yet" (CTA to
   create) from "no results" (CTA to clear filters).

## Invariants

- Always offer a next action (create, import, or clear filters).
- Distinguish first-run-empty from filtered-empty copy.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — both empty variants read
clearly and the CTA works.
