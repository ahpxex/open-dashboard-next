---
name: add-calendar
description: Add a calendar / month-grid view that places records on their dates. Use for scheduling, bookings, events, or any date-anchored collection. Ships a copy-ready template.
---

# Add a calendar view

A 7-column month grid computed via `useMemo` from `{ year, month }` state (Prev/Next
step the month), with events pinned to day numbers as badges. Never reads the wall
clock in render. The page is **bundled** under `templates/` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-calendar/templates/calendar.tsx src/routes/_app/<name>.tsx
```

Then in the copied file:
1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Replace the `EVENTS` array (and the initial `ref` month) with your data keyed by
   day.
3. Real resource: fetch the visible month's records via a `Repository` (filter by
   date range), group them by day, and have a day/event click open its detail.

(Only open the template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/ui/{badge,button}`, `@/lib/utils` (`cn`), `@phosphor-icons/react`
(`CaretLeft`/`CaretRight`), the page-shell heading, and theme tokens
(`border`/`card`/`muted`/`muted-foreground`) — all provided by the base.

## Invariants

- The visible month is **state**; derive the grid from it (never argless
  `new Date()` in render — SSR-unsafe).
- Events render in their day cell; overflow shows a "+N more".

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — Prev/Next change months
and events land on the right days.
