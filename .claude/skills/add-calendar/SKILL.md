---
name: add-calendar
description: Add a calendar / month-grid view that places records on their dates. Use for scheduling, bookings, events, or any date-anchored collection.
---

# Add a calendar view

**Canonical example**: `src/routes/_app/gallery/calendar.tsx` — a 7-column month
grid computed via `useMemo` from `{ year, month }` state (Prev/Next change it),
events pinned to day numbers as badges. Never reads the wall clock in render.

## Add one

1. Copy the canonical file; feed it your events keyed by date.
2. For a real resource, fetch the visible month's records (filter by date range)
   and group them by day; clicking a day/event opens its detail.
3. Add a sidebar entry.

## Invariants

- The visible month is **state**; derive the grid from it (never argless `new Date()`
  in render — SSR-unsafe).
- Events render in their day cell; overflow shows a "+N more".

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — Prev/Next change months
and events land on the right days.
