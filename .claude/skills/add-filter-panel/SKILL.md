---
name: add-filter-panel
description: Add an advanced filter / search panel — multiple controls (text, select, checkbox groups) that compose into a ListParams `{ search, filters }` object driving a list. Use when simple toolbar filters aren't enough. Ships a copy-ready template.
---

# Add a filter / advanced-search panel

A sidebar of controls — text search, a status select, a category checkbox group —
that compose into one `{ search, filters }` object driving a list. Use when the
toolbar's simple filters aren't enough. The full page is **bundled** at
`templates/filter-panel.tsx` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-filter-panel/templates/filter-panel.tsx src/routes/_app/<name>.tsx
```

1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Define your controls + how each maps into `filters` (the `useMemo` that builds
   the `filters` map), and swap the sample `DATA`/`CATEGORIES`/`statusOptions`.
3. Real resource: put the filter state in the URL (`validateSearch`) and pass
   `{ search, filters }` to the resource's list query — the `Repository` adapter
   maps each `filters` key to its backend (see `drizzleRepository.filterColumns`).
   Render the panel beside a `DataTable` instead of the demo's echoed payload.

(Only open the template if you need to customise it — copying costs no context.)

## Foundation it assumes

`@/components/ui/{input,select,checkbox,button,card,badge,label,table}`,
`@phosphor-icons/react` (`MagnifyingGlassIcon`), `@/lib/utils` (`cn`), the
page-shell heading (`font-heading text-2xl …` + muted `<p>`), and theme tokens
(`bg-muted/50`, `text-muted-foreground`).

## Invariants

- Controls compose into the one `ListParams` shape (`search` + a `filters` map).
- Real filters live in the URL (shareable); the adapter whitelists filter keys.
- Provide a "Clear filters" affordance and a result count.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — changing controls updates
the results and the echoed params; "Clear filters" resets and the count tracks.
