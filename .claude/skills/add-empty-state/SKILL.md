---
name: add-empty-state
description: Add a polished empty state — centred icon, headline, description, and primary/secondary CTAs — for first-run, no-data, and filtered-no-results cases. Use so blank screens guide the user instead of looking broken. Ships a copy-ready template.
---

# Add an empty state

A centred icon in a muted circle, headline, muted description, and primary +
secondary CTAs, with a toggle that previews the "filtered, no results" variant.
The page is **bundled** under `templates/` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-empty-state/templates/empty-state.tsx src/routes/_app/<name>.tsx
```

Then in the copied file:
1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Set the icon, copy, and CTAs for each branch; distinguish "no data yet" (CTA to
   create/import) from "no results" (CTA to clear filters).
3. Real use: render it wherever a list/page can be empty — drive the `filtered`
   branch off whether a search/filter is active, and wire the CTAs to your real
   create/clear actions. (Or reuse the `StateView` `empty` state from
   `add-feedback-states`.)

(Only open the template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/ui/{button,switch}`, `@/lib/toast`, `@tanstack/react-router`,
`@phosphor-icons/react`, the page-shell heading, and theme tokens — all provided by
the base (see the `scaffold-dashboard` skill).

## Invariants

- Always offer a next action (create, import, or clear filters).
- Distinguish first-run-empty from filtered-empty copy.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — both empty variants read
clearly and the CTA works.
