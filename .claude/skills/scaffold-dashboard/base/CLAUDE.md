# CLAUDE.md

An **AI-native, agent-composable** back-office / dashboard substrate (a "中台" template) — not a clone-and-hand-edit boilerplate. The repo is the **source of truth for 40+ skills** (`.claude/skills/`), each a copy-ready admin UI *shape* (CRUD, detail, master-detail, kanban, calendar, wizard, billing, RBAC, i18n, …), and a **Skills Gallery** that renders every skill's own demo — kept byte-for-byte in sync with the repo's working code via `sync-skills`, so a skill never ships code the repo hasn't typechecked/built/tested. An agent forks this repo and **composes** a real product from the skills. It is also a real full-stack app (TanStack Start + Drizzle + better-auth) that runs **zero-config** on in-memory adapters (add `DATABASE_URL` for Postgres). This file orients AI agents working in the repo.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) — full-stack React on Vite + Nitro. Server logic runs in **server functions** created with `createServerFn` from `@tanstack/react-start`.
- **Routing**: [TanStack Router](https://tanstack.com/router) — file-based, type-safe routes under `src/routes/`. Route tree is generated into `src/routeTree.gen.ts` (do not edit by hand).
- **Server state**: [TanStack Query](https://tanstack.com/query) — caching + mutations, SSR-integrated via `@tanstack/react-router-ssr-query`.
- **Tables**: [TanStack Table](https://tanstack.com/table) — headless, wrapped by the generic `DataTable` in `src/infra/table`.
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Drizzle ORM](https://orm.drizzle.team/) (`drizzle-orm/node-postgres`). Schema in `src/db/schema.ts`; client in `src/db/index.ts`. Migrations in `./drizzle`, managed with `drizzle-kit`. **The database is the default backend, not a hard requirement**: with no `DATABASE_URL` the app boots on in-memory adapters (`bun dev`, no Docker). See `docs/backends.md`.
- **Auth**: [better-auth](https://www.better-auth.com/) — email + password, real hashed passwords; sessions in Postgres via the Drizzle adapter when `DATABASE_URL` is set, else better-auth's in-memory adapter (zero-config dev). The app reaches auth through the **`AuthProvider` seam** (`src/lib/auth-provider.ts`) + the browser client (`src/lib/auth-client.ts`), so the auth backend is a swappable preset; better-auth config (cookies via the `tanstackStartCookies` plugin — must be the LAST plugin) is in `src/lib/auth.ts`. See `docs/backends.md`.
- **UI**: [shadcn/ui](https://ui.shadcn.com/) components built on **[`@base-ui/react`](https://base-ui.com/) (NOT Radix)**, in `src/components/ui`. **Tailwind CSS v4**, **Phosphor icons** (`@phosphor-icons/react`), light/dark via `next-themes`.
- **Charts**: Recharts. **Client state**: Zustand. **Validation**: Zod (v4).
- **Tooling**: **Bun** (package manager + script runtime), **Biome** (lint + format), **Vitest**. **TypeScript** strict, path alias `@/*` → `./src/*`.

Build pipeline: Vite (`vite.config.ts`) wires `tanstackStart()`, `nitroV2Plugin({ preset: "node-server" })`, `tailwindcss()`, `viteReact()`, and tsconfig paths. Dev server runs on port 3000.

## Architecture

### Routing & auth guard

File-based routes live in `src/routes/`:

- `__root.tsx` — HTML shell, head, providers (`next-themes`).
- `_app.tsx` — **auth-guarded layout**. Its `beforeLoad` calls `getSession()` (a server fn) and `throw redirect({ to: "/login" })` if there's no session; otherwise it returns `{ user }` into the route context. All protected pages live under `src/routes/_app/`.
- `_auth.tsx` — public auth layout; its `beforeLoad` redirects already-authenticated users to `/`. Children: `login`, `register`.
- `api/auth/$.ts` — mounts the auth provider's HTTP handler (`authProvider.handler`) for `GET`/`POST`.

Auth is reached through a seam so the backend is swappable (`docs/backends.md`):
- `src/lib/auth-provider.ts` — the **`AuthProvider`** interface (`getSession(headers)` / `handler(request)`) + the active `authProvider` (better-auth by default). Server-only.
- `getSession()` (`src/lib/auth-server.ts`) — a `createServerFn` wrapping `authProvider.getSession`; use in route `beforeLoad`/loaders. Returns the normalized `{ user }` session.
- `requireUser()` (`src/lib/require-user.ts`) — asserts an authenticated user via `authProvider`; **call at the top of every mutating/protected server-fn handler**. Throws `"UNAUTHORIZED"` if there is no session.
- The browser auth client (`signIn`, `signUp`, `signOut`, `useSession`) is in `src/lib/auth-client.ts` (the browser half of the seam).

### The resource pattern (most important convention)

Every data resource is a self-contained folder under `src/features/<name>/`, paired with a route under `src/routes/_app/<name>.tsx` that renders the generic `DataTable`. **`products` is the canonical example — copy it.** A resource folder contains:

| File | Responsibility |
| --- | --- |
| `schema.ts` | Zod schemas + inferred types: input, update, and list-params (page/pageSize/search/sort/filter). |
| `server.ts` | `createServerFn` handlers (`list*`, `get*`, `create*`, `update*`, `delete*`). Each calls `requireUser()`, validates input via `.validator(...)`, and delegates to a **`Repository` adapter** — `drizzleRepository(table, { searchColumns, sortColumns, filterColumns, defaultSort, updatedAtKey })` for Postgres (imported from `@/infra/data/drizzle-repository`), or `restRepository`/`graphqlRepository` for external APIs. Returns `{ rows, total }`. |
| `queries.ts` | TanStack Query glue: a `*Keys` factory, a `*ListQuery(params)` returning `queryOptions`, and `useCreate*`/`useUpdate*`/`useDelete*` mutation hooks that invalidate the resource's keys on success. |
| `columns.tsx` | `ColumnDef[]` factory taking a context (`onEdit`/`onDelete`). Uses shared cells from `@/infra/ui` (`StatusChip`, `ActionMenu`). |
| `config.ts` | Filter definitions (`FilterConfig[]`) and table config (search placeholder, page-size options, empty message). |

The DB table itself goes in `src/db/schema.ts` alongside `products`.

### The generic `DataTable`

`src/infra/table/DataTable.tsx` is a **fully-controlled, server-driven** table. The page component owns all state (page, pageSize, search, status filter, sorting) — typically via `useState` plus a TanStack Query `useQuery` — and passes it down. The table uses `manualPagination`/`manualSorting`/`manualFiltering` (server does the work). It composes `TableToolbar` (search + filters + refresh) and `TablePaginationControls`. See `src/routes/_app/products.tsx` for the reference wiring, including the create/edit dialog.

### Sidebar

Navigation is configured in `src/lib/sidebar-items.ts` (`mainMenuItems`, `bottomMenuItems`), surfaced via `appConfig.nav`. The sidebar has two halves: **business cases** — two complete back-offices, `E-commerce` (products / orders / customers / refunds + the home dashboard + blog) and `Sales (CRM)` (forecast / pipeline / contacts / companies), that compose the shapes into real verticals — and the **Skills Gallery** — one entry per skill, grouped by category (a `Skills Gallery · Overview` entry, then `Skills · Forms`, `Skills · Lists & tables`, `Skills · Rich views`, `Skills · Detail & pages`, `Skills · Display & feedback`), each linking to that skill's demo under `/gallery/*`. New resources add an item to `mainMenuItems` (`// create-resource:anchor` marks where the generator inserts entries, in the first business group); new business-case groups go above the `// gallery:anchor` line; the `Skills · …` groups stay last.

### Platform layers (compose from these — don't reinvent)

- **Atoms** (`src/components`, `src/config`): the form system (`@/components/form` — TanStack Form + zod; `TextField`/`NumberField`/`SelectField`/`TextareaField`/`SubmitButton`/`FormError`), toast (`@/lib/toast` → sonner), `useConfirm()` (`@/components/ui/confirm-dialog`), chart components (`@/components/charts` — `StatCard`/`ChartCard`/`AreaChart`/`BarChart`/`PieChart`, CSS-var themed), and `appConfig` (`src/config/app.ts` — the single rebrand surface: name/logo/nav/theme).
- **Data access** (`src/infra/data`): the `Repository<T, TInput>` interface + `drizzleRepository` / `restRepository` / `graphqlRepository` / `memoryRepository` (zero-config default) adapters over `ListParams`/`ListResult`. A resource binds an adapter in `server.ts`, typically via `hasDatabase` (`@/lib/backend`). See `docs/data-adapters.md` and `docs/backends.md`.
- **List views** (`src/infra/table`, `src/infra/list`): `DataTable` (server-driven, URL-synced via `useTableSearch`, debounced search, opt-in bulk select) and `CardList` + `useResourceList` (the gallery counterpart, same plumbing).
- **Page archetypes**: CRUD table (`products`), Detail/Show (`products_.$id.tsx` + `DescriptionList`), Master-detail split (`orders.tsx` + `orders.$id.tsx`), Card/grid list (`posts`). Each has a skill in `.claude/skills/`. Catalogue: `PATTERNS.md`.

### Skills Gallery (one demo per skill)

`src/routes/_app/gallery/*` is a **palette of admin UI shapes** — forms, lists,
pages, and rich views (kanban, tree, calendar, timeline, …) an agent picks from
when composing a real app. Each variant is a **self-contained route** (some pair
with small components under `src/components/data`, `src/components/feedback`, or
`src/components/form/ComboboxField.tsx`), runs **zero-config** on local/static
data, and teaches the *shape*, not a persisted resource (no Drizzle tables).

They are surfaced as the **Skills Gallery** in the sidebar — a `Skills Gallery ·
Overview` entry (`/gallery`, `gallery/index.tsx`: a tabbed catalogue of every
shape) plus one entry per skill, grouped into `Skills · Forms` / `Skills · Lists &
tables` / `Skills · Rich views` / `Skills · Detail & pages` / `Skills · Display &
feedback`. The Skills Gallery *is* the proof that each skill produces working UI:
every entry renders that skill's own demo. Full menu: `docs/gallery-catalogue.md`.
On port, edit the `SHAPES` array in `gallery/index.tsx` + the `Skills · …` groups
in `sidebar-items.ts` to keep what you need, and run the **`trim-gallery`** skill
to delete the rest.

### Business cases (composed examples)

Above the Skills Gallery, the sidebar carries **two complete business back-offices**
that *compose* the gallery shapes into believable products — the richest reference
for "how do I assemble a real vertical". `products` and `orders` are real Drizzle
resources (they fall back to in-memory with no `DATABASE_URL`); the rest are
**memory-backed** (`features/<name>/` with `memoryRepository` + `demo-data.ts` —
zero-config CRUD, no Drizzle table):

- **E-commerce** (`/`, `/products`, `/orders`, `/customers`, `/refunds`, `/posts`) — Store overview (charts) · Products (CRUD table + detail) · Orders (master-detail) · Customers (CRUD + detail) · Refunds · Blog (card list, `posts`). These double as the live demos for the foundational archetype skills (`add-crud-resource`, `add-detail-page`, `add-master-detail`, `add-card-list`, `add-chart-page`).
- **Sales (CRM)** (`/crm/*`) — deals pipeline (kanban) · contacts (table) · companies (card list + detail) · forecast (charts).

Each business case is independently removable (delete `features/<name>/` + its
routes + its sidebar group; the `strip-demo` skill documents it).

### Agent layer

`.claude/skills/*` — **40+ skills**, the heart of the template. They split into **archetype/operation** skills (`add-crud-resource`, `add-detail-page`, `add-master-detail`, `add-card-list`, `add-chart-page`, `add-form`, `add-data-source`, `add-backend-preset`, `rebrand`, `strip-demo`, `trim-gallery`, `scaffold-dashboard`) and **shape** skills — one per Skills-Gallery demo (`add-kanban`, `add-calendar`, `add-tree-view`, `add-timeline`, `add-wizard-form`, `add-inline-edit`, `add-virtual-table`, `add-table-columns`, `add-saved-views`, `add-global-search`, `add-rbac`, `add-billing`, `add-i18n`, `add-notifications`, `add-audit-log`, …). Each bundles copy-ready `templates/` **generated from the repo's own working source** by `scripts/sync-skills.ts` (one-way; `bun run sync-skills --check` is the drift guard), so a distributed skill always carries code the repo has typechecked/built/tested — the Skills Gallery is the live proof. `scripts/build-base.ts` assembles the clean base bundle that `scaffold-dashboard` ships. Plus `.claude/commands/*` (`/add-resource`, `/port`), `PATTERNS.md` (the catalogue), and `PORTING.md` (how to start a real product). Find the closest pattern, copy its canonical example, follow its invariants.

## How to add a resource

1. Add a Drizzle table to `src/db/schema.ts`; run `bun run db:generate` then `bun run db:migrate`.
2. Create `src/features/<name>/` with `schema.ts`, `server.ts`, `queries.ts`, `columns.tsx`, `config.ts` (copy from `products`).
3. Add a route `src/routes/_app/<name>.tsx` that wires `DataTable` (copy from `src/routes/_app/products.tsx`).
4. Add a sidebar entry in `src/lib/sidebar-items.ts`.

Or run `bun run create-resource <name>` to scaffold all of the above — it also appends the Drizzle table to `src/db/schema.ts`; after generating, customise the fields and run `bun run db:generate && bun run db:migrate`. Full walkthrough: `docs/resources.md`.

## Conventions (prescriptive)

**ALWAYS**
- Call `requireUser()` first in every protected server-fn handler, and validate
  input with Zod via `.validator(...)`. Data crosses the client↔server boundary
  only through `createServerFn` — there is no manual fetch/REST layer.
- Keep list/sort/filter/page state in the URL (`validateSearch` +
  `useTableSearch`/`useResourceList`), not local `useState`. (Multi-row *selection*
  is the one exception — it's transient local state.)
- Report mutations with a toast and route destructive actions through
  `useConfirm()`. Invalidate the resource's query keys on success.
- Use a `Repository` adapter in `server.ts` (never inline Drizzle/`fetch` in a
  resource). Import `drizzleRepository` from `@/infra/data/drizzle-repository`.
- Compose from the platform layers above (form system, charts, `DataTable`/
  `CardList`, archetypes). Find the closest pattern in `PATTERNS.md` and copy it.
- Use the `@/*` alias. Before finishing, run `bun run typecheck && bun run check
  && bun run test` (and `bun run build` for infra changes).

**NEVER**
- Import `@/db` (or the Drizzle adapter) from a client-reachable module — it
  leaks `pg` into the browser. Adapters/secrets stay in server fns only.
- Hand-edit `src/routeTree.gen.ts` (it's generated).
- Hardcode the brand — change `src/config/app.ts`.
- Reintroduce Next.js, Hero UI, TypeORM, or Refine. shadcn/ui here is built on
  `@base-ui/react`, **not** Radix.
- Sort by raw user input — use the adapter's `sortColumns` whitelist.

## Commands

- `bun run dev` — dev server (port 3000).
- `bun run db:up` / `bun run db:down` — start/stop local Postgres (Docker Compose).
- `bun run db:generate` / `db:migrate` / `db:push` / `db:studio` — Drizzle migrations & Studio.
- `bun run db:seed` — seed demo products + a dev account.
- `bun run build` / `bun run start` — production build / run Nitro server.
- `bun run check` / `lint` / `format` — Biome.
- `bun run typecheck` — `tsc --noEmit`. `bun run test` — Vitest.

See `README.md` for full setup, `docs/resources.md` for the resource guide,
`docs/data-adapters.md` for data adapters, `docs/backends.md` for swapping the
data/auth backend (presets), `PATTERNS.md` for the shape catalogue, and
`PORTING.md` to start a real product.
