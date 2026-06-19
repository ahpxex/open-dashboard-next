---
name: add-record-tabs
description: Add a record detail with tabs (Overview / Activity / Settings …) where the active tab is synced to the URL. Use when one record has several distinct sub-views.
---

# Add a tabbed record

**Canonical example**: `src/routes/_app/gallery/record-tabs.tsx` — a record header
+ controlled `Tabs` whose active tab is a URL search param
(`validateSearch: z.object({ tab: z.enum([...]).default("overview") })`,
read with `Route.useSearch()`, set with `Route.useNavigate({ search: { tab } })`).
Overview uses `DescriptionList`.

## Add one

1. Copy the canonical file; define your tab enum + each tab's content.
2. For a real record, load it in the route `loader` (`getOne(id)`) and render the
   tabs from the loaded data; each tab can lazy-load its own data.
3. Add a sidebar entry (or reach it from a detail page).

## Invariants

- Active tab lives in the URL (shareable, back/forward works) — not local state.
- Detail query key `["<resource>","detail",id]`; tabs read from the loaded record.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — switching tabs updates
the URL and back/forward restores the tab.
