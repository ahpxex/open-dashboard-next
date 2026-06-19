---
name: add-infinite-list
description: Add an infinite / load-more list — items load in pages via a "Load more" button and/or scroll-near-bottom, instead of numbered pagination. Use for feeds and long collections where a pager is awkward.
---

# Add an infinite / load-more list

The `infinite` option to a list: grow a visible window instead of paging.

**Canonical example**: `src/routes/_app/gallery/list-infinite.tsx` — a 200-item
dataset, a `useState(20)` window, a "Load more" (+20) button plus a scroll-near-
bottom trigger, a "Showing X of N" counter, and an end-of-list state.

## Add one

1. Copy the canonical file to `src/routes/_app/gallery/<name>.tsx`.
2. For a real resource, back it with a `Repository` that pages by cursor/offset —
   request the next page on "load more", append to the accumulated list, keep the
   cursor in state. Keep filters/search in the URL.
3. Add a sidebar entry.

## Invariants

- The button must always work (scroll trigger is an enhancement, not the only path).
- Show how many are loaded vs total, and a clear end-of-list state.
- Remote variant: handle loading (next page spinner) and error (retry) explicitly.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — load more grows the list
and stops cleanly at the end.
