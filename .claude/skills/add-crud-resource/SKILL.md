---
name: add-crud-resource
description: Scaffold a full CRUD resource (Postgres table + server fns + query hooks + DataTable page + create/edit dialog + sidebar entry). Use when the user wants a new data entity with a server-driven list (paginate/sort/search/filter) and create/edit/delete.
---

# Add a CRUD resource

The CRUD table is the base archetype. `products` is the canonical reference;
`orders` is a generated example.

## Steps

1. **Generate the vertical** (table + feature + route + sidebar entry, auto-formatted):
   ```bash
   bun run create-resource <plural-name>   # e.g. customers
   ```
   This creates `src/features/<name>/{schema,server,queries,columns,config}.ts(x)`
   and the route `src/routes/_app/<name>.tsx`, appends a Drizzle table to
   `src/db/schema.ts`, and inserts a sidebar item.

2. **Customise the fields** in `src/db/schema.ts` (the appended `pgTable`) and in
   `src/features/<name>/schema.ts` (the zod input / form / list-params schemas).
   Keep numeric form fields non-coercing in `*FormSchema` (input must match the
   form value type); the server `*InputSchema` may coerce. Filter params that can
   be numeric must use `z.coerce.string()` (the router JSON-parses search params).

3. **Adjust** `columns.tsx` (cells, sortable columns), `config.ts` (filters,
   search placeholder), and the `server.ts` `drizzleRepository` config
   (`searchColumns`, `sortColumns`, `filterColumns`).

4. **Migrate**:
   ```bash
   bun run db:generate && bun run db:migrate
   ```

5. **Verify**: `bun run typecheck && bun run check && bun run test`, then open
   `/<name>` in the dev server.

## Invariants (must hold)

- Every server-fn handler calls `requireUser()` first and validates input via
  `.validator(zodSchema.parse)`.
- List state lives in the URL (`validateSearch` + `useTableSearch`); never local
  `useState`.
- Mutations show a toast and invalidate the resource's query keys; deletes go
  through `useConfirm()`.
- The Drizzle adapter is imported from `@/infra/data/drizzle-repository`
  (server-only), never from a client component.
- The page wraps `DataTable` in a **full-height flex column** —
  `<div className="flex h-full flex-col gap-6">` with the header as `shrink-0` —
  so the pagination bar pins to the bottom instead of trailing the rows (the app
  shell sizes each page to the viewport). The generator emits this; keep it.

## Related

`add-detail-page`, `add-card-list`, `add-master-detail`, `add-form`,
`add-data-source`. See `PATTERNS.md` and `docs/resources.md`.
