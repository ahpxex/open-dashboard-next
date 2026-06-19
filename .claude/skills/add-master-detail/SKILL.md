---
name: add-master-detail
description: Turn a resource's list into a master-detail view — the list stays mounted on the left and a record detail opens in a side panel on the right via a nested route, with selection in the URL. Use for triage/inbox-style screens. Ships a copy-ready template.
---

# Add a Master-detail (split) view

The list stays mounted on the left; selecting a row opens its detail in a side
panel on the right via a nested route, with selection in the URL. Both halves are
**bundled** — `templates/orders.tsx` (list + layout) and `templates/orders.$id.tsx`
(side panel). Copy, don't paste.

## Add one

```bash
cp .claude/skills/add-master-detail/templates/orders.tsx src/routes/_app/<name>.tsx
cp .claude/skills/add-master-detail/templates/orders.\$id.tsx src/routes/_app/<name>.\$id.tsx
```

The **dot** in `<name>.$id` nests the panel under the list layout so it renders in
the list's `<Outlet>`. (Contrast `add-detail-page`'s `<name>_.$id` — the
underscore makes a standalone page; the dot makes a nested panel.)

Then in the copied files:
1. Set `createFileRoute("/_app/<name>")` and `createFileRoute("/_app/<name>/$id")`
   and swap every `orders` import for your resource (`features/<name>/...`).
2. `<name>.tsx` (list): the `DataTable` is already wrapped in a flex row beside an
   `<Outlet />`. It reads the selected id from `useChildMatches()` and passes it to
   the columns factory for highlight. Make the name cell a
   `<Link to="/<name>/$id">`. Wire your resource's columns/filters/config/queries.
3. `<name>.$id.tsx` (panel): point the `loader` at `<name>DetailQuery(params.id)`
   and adjust the `<aside>` header / `DescriptionList` / Edit-Delete to your
   fields. Close = `navigate({ to: "/<name>", search: (prev) => prev })` (preserves
   list params).

These templates wire the real `orders` resource. A new master-detail view also
needs a matching `features/<name>/` resource that exports a `<name>DetailQuery`
(+ a `detail` key — see `add-detail-page`) alongside its list/columns/config —
`add-crud-resource` / `create-resource` scaffolds the resource.

(Only open a template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/ui/{button,skeleton}`, `@/components/ui/confirm-dialog`
(`useConfirm`), `@/infra/list` (`useResourceList`), `@/infra/table` (`DataTable`),
`@/infra/ui` (`DescriptionList`, `StatusChip`), `@tanstack/react-query`
(`useQuery`), `@tanstack/react-router` (`Outlet`, `useChildMatches`, `notFound`,
`useNavigate`), `@phosphor-icons/react`, the page-shell heading, and theme tokens
(`text-muted-foreground`, `border-border`) — all provided by the base. Plus the
target resource's `features/<name>/` (list query + detail query + columns +
config + form dialog).

## Invariants

- Selection lives in the URL (`/<name>/$id`); the list stays mounted and keeps
  its search params.
- The list query stays cached while the panel loads its own detail query.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — in `/<name>` click a
row → panel opens (URL gets `/$id`, list still visible) → close returns to the
list.
