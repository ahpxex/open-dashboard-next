---
name: add-detail-page
description: Add a Detail/Show page for a resource at /<resource>/$id — loads one record, shows a DescriptionList of fields, with breadcrumb + edit/delete. Use when the user wants to view/drill into a single record.
---

# Add a Detail/Show page

Canonical example: `src/routes/_app/products_.$id.tsx` (+ `DescriptionList`).

## Steps

1. **Add a detail query** to the resource's `queries.ts`:
   ```ts
   export const <name>DetailQuery = (id: string) =>
     queryOptions({ queryKey: <name>Keys.detail(id), queryFn: () => get<Type>({ data: id }) });
   ```
   Add `detail: (id) => [...<name>Keys.all, "detail", id]` to the keys factory.
   Ensure the resource's `server.ts` exports a `get<Type>` server fn (the
   generator and `drizzleRepository.getOne` provide this).

2. **Create the route** `src/routes/_app/<name>_.$id.tsx`. The trailing
   underscore (`<name>_`) opts the detail OUT of the list route's layout so it is
   a standalone page (not nested under the list). The route id is
   `/_app/<name>_/$id`; the URL is `/<name>/$id`.
   - `loader`: `ensureQueryData(<name>DetailQuery(params.id))`; `throw notFound()`
     when the record is null.
   - Component: breadcrumb (`Link` to the list) → header (name + `StatusChip` +
     Edit/Delete) → `<DescriptionList>` of fields. Handle loading (Skeleton) and
     missing states.

3. **Link from the list**: in `columns.tsx`, render the name cell as
   `<Link to="/<name>/$id" params={{ id: row.id }}>`.

4. **Reuse the form**: open the shared `<Resource>FormDialog` for Edit; on Delete,
   `confirm()` then `mutateAsync` then `navigate({ to: "/<name>" })`.

## Invariants

- Detail query key: `["<name>", "detail", id]`.
- `notFound()` on missing record; explicit loading + not-found UI.
- Reuse the same form dialog the list uses (extract it to
  `features/<name>/<Resource>FormDialog.tsx` if still inline).

## Verify

`bun run typecheck && bun run check && bun run test`, then click a row name in
`/<name>` and confirm the detail renders + Edit/Delete work.
