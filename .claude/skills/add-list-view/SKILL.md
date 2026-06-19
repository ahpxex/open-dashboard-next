---
name: add-list-view
description: Add a dense / compact LIST view (not a table) — rows with a leading avatar/icon, a primary + secondary line, and trailing meta. Use for people, activity, notifications, or any collection that reads better as a list than a grid. Supports a lazy-loaded variant. Ships a copy-ready template.
---

# Add a list view

A compact list is the right shape when rows have a clear primary label + secondary
detail and don't need columns — people, activity, notifications. A `lite` variant
(flat searchable rows) and a `lazy` variant (collapsible sections that fetch on
first expand) are **bundled** under `templates/` — copy, don't paste.

## Add one

```bash
# dense flat rows + client-side search box
cp .claude/skills/add-list-view/templates/list-lite.tsx src/routes/_app/<name>.tsx
# OR collapsible sections that lazy-load items on first expand
cp .claude/skills/add-list-view/templates/list-lazy.tsx src/routes/_app/<name>.tsx
```

1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Swap the row shape + sample data (`MEMBERS` for lite, `SECTIONS`/`buildItems`
   for lazy) for yours.
3. Real resource: drive it from a `Repository` via `useResourceList`/`useQuery`
   (see `add-card-list`) instead of the local array, keeping search/filter in the
   URL. In the lazy variant, replace the `setTimeout` with the section's list query.

(Only open a template if you need to customise it — copying costs no context.)

## Foundation it assumes

- **lite**: `@/components/ui/{avatar,badge,input}`, `@phosphor-icons/react`
  (`MagnifyingGlassIcon`).
- **lazy**: `@/components/ui/{badge,skeleton}`, `@phosphor-icons/react`
  (`CaretRightIcon`).
- Both: the page-shell heading (`font-heading text-2xl …` + muted `<p>`) and theme
  tokens (`border-border`, `divide-border`, `text-muted-foreground`, `bg-muted/50`).

## Invariants

- Density is the point — compact rows, secondary text muted, no table chrome.
- Always handle empty (and, for remote data, loading + error) explicitly. The lazy
  variant shows skeletons on first expand and caches items after.
- Search/filter that affects the result set lives in the URL for real resources
  (the bundled demos use local `useState`).

## Verify

`bun run typecheck && bun run check`, then `bun run dev` and confirm the list
renders, filters (lite) or expands and lazy-loads (lazy), and shows its empty state.
