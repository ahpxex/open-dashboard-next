---
name: add-card-list
description: Render a resource as a responsive card gallery instead of (or beside) a table, reusing the same search/filter/paginate plumbing. Use for galleries, people, products-as-cards, blog posts.
---

# Add a Card/grid list

Canonical example: `src/routes/_app/posts.tsx` + `src/features/posts/cards.tsx`
(`CardList` + `useResourceList`).

## Steps

1. **Card renderer** `src/features/<name>/cards.tsx` — parallel to `columns.tsx`.
   Export a `<Resource>Card` that renders a `<Card>` for one record plus an
   `<ActionMenu>` (edit/delete) wired through a `context` prop.

2. **Use `useResourceList`** in the route to bundle URL state + the query:
   ```ts
   const { table, rows, total, isLoading, refetch } =
     useResourceList<typeof search, <Type>>(search, navigate, <name>ListQuery);
   ```

3. **Render `<CardList>`** (from `@/infra/list`) with the same controlled props
   as `DataTable` (search/filter/pagination), plus:
   ```tsx
   getKey={(item) => item.id}
   renderCard={(item) => <ResourceCard item={item} context={cardContext} />}
   ```
   `CardList` reuses the toolbar (debounced search + filters) and pagination, and
   handles loading-skeleton + empty states.

4. Keep the create/edit dialog + `useConfirm` delete exactly as the table page.

## Invariants

- Same `ListParams` / query keys / URL state as the table — only the
  presentation differs.
- A card page and a table page for the same resource share `useResourceList`.

## Verify

`bun run typecheck && bun run check && bun run test`, then open `/<name>` and
confirm the grid, search, filter, and pagination all work.
