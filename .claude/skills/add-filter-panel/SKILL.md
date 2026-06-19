---
name: add-filter-panel
description: Add an advanced filter / search panel — multiple controls (text, select, checkbox groups) that compose into a ListParams `{ search, filters }` object driving a list. Use when simple toolbar filters aren't enough.
---

# Add a filter / advanced-search panel

**Canonical example**: `src/routes/_app/gallery/filter-panel.tsx` — search +
status select + category checkbox group composed into a `{ search, filters }`
object that filters a dataset; it echoes the live `ListParams`-style payload so the
mapping is explicit.

## Add one

1. Copy the canonical file; define your controls + how each maps into `filters`.
2. For a real resource, put the filter state in the URL (`validateSearch`) and pass
   `{ search, filters }` to the resource's list query — the `Repository` adapter
   maps each `filters` key to its backend (see `drizzleRepository.filterColumns`).
3. Add a sidebar entry (or render the panel beside a `DataTable`).

## Invariants

- Controls compose into the one `ListParams` shape (`search` + `filters` map).
- Real filters live in the URL (shareable); the adapter whitelists filter keys.
- Provide a "clear filters" affordance and a result count.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — changing controls updates
the results and the echoed params.
