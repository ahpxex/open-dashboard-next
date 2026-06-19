---
name: add-list-view
description: Add a dense / compact LIST view (not a table) — rows with a leading avatar/icon, a primary + secondary line, and trailing meta. Use for people, activity, notifications, or any collection that reads better as a list than a grid. Supports a lazy-loaded variant.
---

# Add a list view

A compact list is the right shape when rows have a clear primary label + secondary
detail and don't need columns. It shares the same data conventions as the table.

**Canonical examples**
- `src/routes/_app/gallery/list-lite.tsx` — dense rows (avatar + name + muted
  email/role + trailing status/time), with a client-side search box and empty state.
- `src/routes/_app/gallery/list-lazy.tsx` — collapsible sections whose items
  **lazy-load on first expand** (skeleton while loading, cached after).

## Add one

1. Copy `list-lite.tsx` to `src/routes/_app/gallery/<name>.tsx` (or a real route).
2. Swap the row shape + sample data. For a real resource, drive it from a
   `Repository` via `useResourceList`/`useQuery` (see `add-card-list`) instead of
   the local array, keeping search/filter in the URL.
3. Add a sidebar entry at the `// gallery:anchor` (or your nav group).

## Invariants

- Density is the point — compact rows, secondary text muted, no table chrome.
- Always handle empty (and, for remote data, loading + error) explicitly.
- Search/filter that affects the result set lives in the URL for real resources
  (gallery demo uses local `useState`).

## Verify

`bun run typecheck && bun run check`, then `bun run dev` and confirm the list
renders, filters, and shows its empty state.
