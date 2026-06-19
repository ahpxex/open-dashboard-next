---
name: add-virtual-table
description: Add a virtualized / windowed table that stays smooth with thousands of rows by rendering only the visible slice. Use when a list/table can hold 1000s of rows client-side.
---

# Add a virtualized table

When a dataset is large enough that rendering every row janks, window it: render
only the rows in (and just around) the viewport, with spacers for the rest.

**Canonical example**: `src/routes/_app/gallery/table-virtual.tsx` — 5000
deterministic rows, a fixed-height scroll container with fixed row height,
scroll-driven visible-slice computation + overscan, top/bottom spacer rows, a
sticky header, and total/visible counters. No extra dependency.

## Add one

1. Copy the canonical file; set your row height + column set.
2. Feed it your rows (for a real resource, fetch a large page once or stream).
3. Add a sidebar entry.

## Invariants

- Row height is fixed (windowing math depends on it); keep a small overscan.
- Header stays sticky; show total + visible counts.
- No new dependency — the windowing is hand-rolled and self-contained.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — scrolling stays smooth
and rows render correctly at the top, middle, and bottom.
