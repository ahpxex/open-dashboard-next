# Patterns — the catalogue of admin shapes

> This is the vocabulary an agent composes from. Each **pattern** is a page shape
> (or a building block) with a fixed contract, a canonical example in the repo, and
> the exact files to copy. When adding to this app, find the closest pattern here,
> copy its example, and follow its invariants — don't invent a new structure.

**Status:** ✅ implemented & verified · 🚧 planned (spec below is the build target).

See [`ROADMAP.md`](./ROADMAP.md) for sequencing. Once a pattern ships, a matching
skill lives in `.claude/skills/` and this file links to it.

---

## Catalogue

| Pattern | Status | Use when | Canonical example | Skill |
| --- | --- | --- | --- | --- |
| **CRUD table** | ✅ | List rows with server-side paginate/sort/search/filter + create/edit/delete + bulk select | `features/products`, `routes/_app/products.tsx` | `add-crud-resource` |
| **Detail / Show** | ✅ | View one record (`/<resource>/$id`) + edit/delete entry | `routes/_app/products_.$id.tsx` | `add-detail-page` |
| **Master-detail / nested** | ✅ | List + record detail in a side panel (selection in URL) | `routes/_app/orders.tsx` + `orders.$id.tsx` | `add-master-detail` |
| **Card / grid list** | ✅ | Gallery of cards (same data plumbing as the table) | `routes/_app/posts.tsx` + `features/posts/cards.tsx` | `add-card-list` |
| **Form page / dialog** | ✅ | Create/edit via a shared keyed-remount dialog (or full-page route) | `features/products/ProductFormDialog.tsx` | `add-form` |
| **Chart page** | ✅ | Dashboard/analytics view from datasets | `routes/_app/index.tsx` (chart components) | `add-chart-page` |

### Building blocks (atoms every pattern uses)

| Block | Status | Notes |
| --- | --- | --- |
| `DataTable` | ✅ | `src/infra/table/DataTable.tsx` — generic controlled table; URL-synced via `useTableSearch`, debounced search |
| `StatusChip`, `ActionMenu` | ✅ | `src/infra/ui/*` |
| UI primitives (28) | ✅ | `src/components/ui/*` (shadcn-on-base-ui) |
| **Form system** (TanStack Form + zod + `<FormField>`) | ✅ | `src/components/form/*` — `TextField`/`NumberField`/`SelectField`/`TextareaField`/`SubmitButton`/`FormError` |
| **Toast** | ✅ | `sonner` via `src/lib/toast.ts`; mutations report success/error |
| **`<ConfirmDialog>` / `useConfirm()`** | ✅ | `src/components/ui/confirm-dialog.tsx` — promise-based, replaces `window.confirm` |
| **Chart components** (`Area/Bar/Pie/StatCard`) | ✅ | `src/components/charts/*` — generic over row type, CSS-var themed |
| **Date / range / combobox / upload** | 🚧 | Phase 1+ as needed |
| `app.config` (brand/nav/theme) | ✅ | `src/config/app.ts` — single rebrand surface |

### Data access

| Piece | Status | Notes |
| --- | --- | --- |
| `Repository<T, TInput>` interface | ✅ | `src/infra/data/repository.ts` — `list/getOne/create/update/remove` |
| `drizzleRepository` | ✅ | `src/infra/data/drizzle-repository.ts` — backs products/orders |
| `restRepository` | ✅ | `src/infra/data/rest-repository.ts` — backs `posts` (jsonplaceholder) |
| `graphqlRepository` | ✅ | `src/infra/data/graphql-repository.ts` — shipped + unit-tested |

See [`docs/data-adapters.md`](./docs/data-adapters.md) for the full guide.

---

## Shared invariants (every pattern obeys these)

1. **List params** are one shape everywhere:
   `{ page, pageSize, search?, sortBy?, sortDir?, filters? }` → returns `{ rows, total }`.
2. **Data only via server functions** (`createServerFn`), each calling `requireUser()`
   (and later `requireRole`). Adapters/secrets never enter the client bundle.
3. **List/selection state lives in the URL** (`validateSearch`), not local `useState`.
4. **Query keys**: `["<resource>", "list", params]` / `["<resource>", "detail", id]`.
   Mutations invalidate `["<resource>"]`.
5. **Feedback**: mutations show a toast; destructive actions go through `useConfirm()`.
6. **States**: every pattern handles loading (skeleton), empty, and error explicitly.
7. **A resource lives in `features/<name>/`**; a route in `routes/_app/<name>...`.

---

## ✅ CRUD table (reference, implemented)

**Files**
- `src/features/products/` — `schema.ts` (zod + statuses), `server.ts` (server fns
  with `requireUser`), `queries.ts` (TanStack Query hooks), `columns.tsx`, `config.ts`.
- `src/routes/_app/products.tsx` — the page (DataTable + create/edit dialog).
- `src/infra/table/DataTable.tsx` — the generic controlled table.

**Contract** — page owns list state and passes it to `DataTable`; `DataTable` renders
toolbar (search/filter/refresh) + table (sortable headers) + pagination, all controlled.

**Add one** — `bun run create-resource <name>` scaffolds the whole vertical, then
`bun run db:generate && bun run db:migrate`. (Today: inline drizzle. After Phase 2:
the generated `server.ts` binds a `Repository` adapter.)

**Known gaps vs target** — list state is local `useState` (→ URL, Phase 1); delete uses
`window.confirm` (→ `useConfirm`, Phase 1); no bulk-select (Phase 3); inline drizzle
(→ repository, Phase 2).

---

## 🚧 Detail / Show  *(build target)*

**Route** `routes/_app/<resource>/$id.tsx` — `loader` prefetches
`getOne(id)` via `ensureQueryData`; `notFound()` when missing.
**Layout** header (title + status + actions: Edit/Delete) → sections of
`<DescriptionList>` (a new atom) → related lists (reuse `DataTable`/card-list scoped to
the parent id). **Edit** opens the form (dialog or `/$id/edit`).
**Invariants**: detail query key `["<resource>","detail",id]`; breadcrumb to the list.

## 🚧 Master-detail / nested  *(build target)*

Two flavours, both via **nested routes**:
- **Split**: `routes/_app/<resource>.tsx` keeps the list; `…/<resource>.$id.tsx` renders
  a side panel `<Outlet>` beside it (list stays mounted, selection in URL).
- **Record tabs**: `…/$id.tsx` is a layout with tabbed sub-routes
  (`…/$id/index`, `…/$id/activity`, `…/$id/settings`).
**Invariants**: selection/active-tab in the URL; the list query stays cached while the
panel loads its own detail query.

## 🚧 Card / grid list  *(build target)*

Same data plumbing as the table — extract a shared **`useResourceList(repository, params)`**
hook (list state from URL + query). `CardList` renders a responsive grid of a
per-resource `<Card>` renderer (parallel to `columns.tsx`, e.g. `cards.tsx`), reusing the
existing toolbar + pagination controls. Use for galleries, people, products-as-cards.

---

## 🚧 Atoms (build targets, condensed)

- **Form system** — `<Form>` (wraps TanStack Form's `useForm` with zod Standard-Schema
  validators) + `<FormField name>` bound to `ui/field`/`ui/label`; surfaces server validation
  errors. Replaces hand-rolled forms.
- **Toast** — `toast.success/error`; mutations report through it.
- **ConfirmDialog** — `const ok = await confirm({title, description, destructive})`.
- **Charts** — `components/charts/{AreaChart,BarChart,PieChart,StatCard}.tsx`, themed via
  `lib/color-theme`, responsive, consistent tooltip/legend. Dashboard refactors onto them.
- **app.config** — `src/config/app.ts`: `{ name, logo, nav, theme }`; consumed by the
  sidebar, root head, and auth pages. The single place to rebrand.

---

## 🚧 Data-source adapter (portability-critical)

```ts
// src/infra/data/repository.ts
export interface ListParams {
  page: number; pageSize: number;
  search?: string; sortBy?: string; sortDir?: "asc" | "desc";
  filters?: Record<string, string>;
}
export interface ListResult<T> { rows: T[]; total: number; }

export interface Repository<T, TInput> {
  list(params: ListParams): Promise<ListResult<T>>;
  getOne(id: string): Promise<T | null>;
  create(input: TInput): Promise<T>;
  update(id: string, input: Partial<TInput>): Promise<T>;
  remove(id: string): Promise<void>;
}
```

**Adapters** implement the same interface:
- `drizzleRepository(table, { searchColumns, sortColumns })` — Postgres via Drizzle.
- `restRepository<T>({ baseUrl, path, map })` — proxy to an existing REST API (called
  inside a server fn, so credentials stay server-side).
- `graphqlRepository(...)` — same interface over a GraphQL endpoint.

A resource's `server.ts` picks an adapter; the rest of the vertical (queries, table,
detail, card-list) is **unchanged** regardless of backend. This is what "port it into the
shape I need" relies on — swap the adapter, keep the shapes.
