---
name: add-master-detail
description: Turn a resource's list into a master-detail view — the list stays mounted on the left and a record detail opens in a side panel on the right via a nested route, with selection in the URL. Use for triage/inbox-style screens.
---

# Add a Master-detail (split) view

Canonical example: `src/routes/_app/orders.tsx` (layout + list) +
`src/routes/_app/orders.$id.tsx` (side panel).

## Steps

1. **Detail query**: add `<name>DetailQuery` + a `detail` key (see
   `add-detail-page`).

2. **Make the list a layout**: in `src/routes/_app/<name>.tsx`, wrap the
   `DataTable` in a flex row and add a sibling `<Outlet />`:
   ```tsx
   <div className="flex flex-1 items-start gap-4">
     <div className="min-w-0 flex-1"><DataTable … /></div>
     <Outlet />
   </div>
   ```
   Read the selected id from `useChildMatches()` and pass it to the columns
   factory (for highlight). Make the name cell a `<Link to="/<name>/$id">`.

3. **Side panel route** `src/routes/_app/<name>.$id.tsx` — note the **dot**
   (`<name>.$id`), which nests it under the list layout so it renders in the
   `<Outlet>`. Render an `<aside>` panel: header (name + status + close `X`),
   `<DescriptionList>`, Edit/Delete. Close = `navigate({ to: "/<name>",
   search: (prev) => prev })` (preserve list params).

   (Contrast with `add-detail-page`'s `<name>_.$id` — the underscore makes a
   standalone page; the dot makes a nested panel.)

## Invariants

- Selection lives in the URL (`/<name>/$id`); the list stays mounted and keeps
  its search params.
- The list query stays cached while the panel loads its own detail query.

## Verify

`bun run typecheck && bun run check`, then in `/<name>` click a row → panel
opens (URL gets `/$id`, list still visible) → close returns to the list.
