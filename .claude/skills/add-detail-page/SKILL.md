---
name: add-detail-page
description: Add a Detail/Show page for a resource at /<resource>/$id — loads one record, shows a DescriptionList of fields, with breadcrumb + edit/delete. Use when the user wants to view/drill into a single record. Ships a copy-ready template.
---

# Add a Detail/Show page

A standalone page at `/<name>/$id` that loads one record and shows a breadcrumb,
a header (name + `StatusChip` + Edit/Delete), and a `DescriptionList` of fields,
with loading + not-found states. The route is **bundled** at
`templates/products_.$id.tsx` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-detail-page/templates/products_.$id.tsx src/routes/_app/<name>_.\$id.tsx
```

The trailing underscore (`<name>_`) opts the detail OUT of the list route's
layout, so it is a standalone page (route id `/_app/<name>_/$id`; URL
`/<name>/$id`).

Then in the copied file:
1. Set `createFileRoute("/_app/<name>_/$id")` and swap every `products` import
   for your resource (`features/<name>/...`).
2. Point the `loader` at the resource's `<name>DetailQuery(params.id)` and the
   component at `useDeleteProduct`/`<Resource>FormDialog` equivalents. Adjust the
   `DescriptionList` `items` to your fields, and the breadcrumb/`navigate` targets
   to `/<name>`.
3. Link from the list: in the resource's `columns.tsx`, render the name cell as
   `<Link to="/<name>/$id" params={{ id: row.id }}>`.

This template wires the real `products` resource. A new detail page also needs a
matching `features/<name>/` resource that exports a `get<Type>` server fn and a
`<name>DetailQuery` (with a `detail: (id) => [...<name>Keys.all, "detail", id]`
key) — `add-crud-resource` / `create-resource` scaffolds the resource, and
`drizzleRepository.getOne` provides `get<Type>`. Reuse the same form dialog the
list uses (extract it to `features/<name>/<Resource>FormDialog.tsx` if inline).

(Only open the template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/ui/{button,skeleton}`, `@/components/ui/confirm-dialog`
(`useConfirm`), `@/infra/ui` (`DescriptionList`, `StatusChip`),
`@tanstack/react-query` (`useQuery`), `@tanstack/react-router` (`Link`,
`notFound`, `useNavigate`, `ensureQueryData` in the loader),
`@phosphor-icons/react`, the page-shell heading, and theme tokens
(`text-muted-foreground`, `border-border`) — all provided by the base. Plus the
target resource's `features/<name>/` (queries + form dialog + columns).

## Invariants

- Detail query key: `["<name>", "detail", id]`.
- `notFound()` on a missing record; explicit loading (Skeleton) + not-found UI.
- Reuse the same form dialog the list uses; selection/navigation targets the
  `/<name>` list.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — click a row name in
`/<name>` and confirm the detail renders + Edit/Delete work.
