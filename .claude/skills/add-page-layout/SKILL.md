---
name: add-page-layout
description: Add a multi-column page layout — e.g. a main content column plus a right aside (summary/metadata), responsive down to one column. Use when a page needs primary content beside contextual side content.
---

# Add a page layout

**Canonical example**: `src/routes/_app/gallery/split-layout.tsx` — a two-column
layout via `grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6` (main content + right
aside) that collapses to one column on small screens.

## Add one

1. Copy the canonical file; put primary content in the main column and contextual
   content (summary, metadata, actions) in the aside.
2. Keep the aside non-essential — the page must still make sense when it stacks
   below on mobile.

## Invariants

- Responsive by default (collapses to one column); the aside is supplementary.
- Use the page-shell heading convention; compose existing blocks
  (`Card`, `DescriptionList`, data-display) inside.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — resize: two columns on
desktop, stacked on mobile.
