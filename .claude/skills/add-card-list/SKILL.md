---
name: add-card-list
description: Render a resource as a responsive card gallery instead of (or beside) a table, reusing the same search/filter/paginate plumbing. Use for galleries, people, products-as-cards, blog posts. Ships a copy-ready template.
---

# Add a Card/grid list

A resource rendered as a responsive card grid instead of a table, reusing the
same URL state + query + search/filter/paginate plumbing (`useResourceList` +
`CardList`). The route is **bundled** at `templates/posts.tsx` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-card-list/templates/posts.tsx src/routes/_app/<name>.tsx
```

Then in the copied file:
1. Set `createFileRoute("/_app/<name>")` and swap every `posts` import for your
   resource (`features/<name>/...`).
2. `useResourceList<typeof search, <Type>>(search, navigate, <name>ListQuery)`
   drives the list; render `<CardList>` with the same controlled props as
   `DataTable` (search/filter/pagination) plus `getKey={(item) => item.id}` and
   `renderCard={(item) => <ResourceCard item={item} context={cardContext} />}`.
   Wire your resource's filters/config.
3. Keep the create/edit dialog + `useConfirm` delete exactly as the table page —
   only the presentation differs from a table.

This template wires the real `posts` resource. A new card list also needs a
matching `features/<name>/` resource and a `features/<name>/cards.tsx` (parallel to
`columns.tsx`) exporting a `<Resource>Card` that renders one record's `<Card>` plus
an `<ActionMenu>` wired through a `context` prop — `add-crud-resource` /
`create-resource` scaffolds the resource; add `cards.tsx` alongside it.

(Only open the template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/infra/list` (`CardList`, `useResourceList`), `@/components/form` (`FormError`,
`NumberField`, `TextField`, `TextareaField`, `SubmitButton`),
`@/components/ui/{button,dialog}`, `@/components/ui/confirm-dialog` (`useConfirm`),
`@/lib/toast` (`errorMessage`), `@tanstack/react-form` (`useForm`),
`@tanstack/react-router`, `@phosphor-icons/react`, the page-shell heading, and
theme tokens (`text-muted-foreground`) — all provided by the base. Plus the
target resource's `features/<name>/` (list query + mutations + filters + config +
`cards.tsx`).

## Invariants

- Same `ListParams` / query keys / URL state as the table — only the
  presentation differs.
- A card page and a table page for the same resource share `useResourceList`.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — open `/<name>` and
confirm the grid, search, filter, and pagination all work.
