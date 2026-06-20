# CLAUDE.md

## What this is — read first

An **AI-native, skill-driven** back-office substrate (a "中台" template). The repo
is **not a product**. It is the **source of truth for the skill catalogue**
(`.claude/skills/`): one **`add-component`** skill — a catalogue + retriever over
**35+ copy-ready admin UI shapes** (CRUD, detail, master-detail, kanban, calendar,
wizard, billing, RBAC, i18n, …), each a reference doc + a generated template — plus
a handful of **operation skills** (`scaffold-dashboard`, `add-crud-resource`,
`add-data-source`, `add-backend-preset`, `rebrand`, `add-tests`). A **Skills
Gallery** renders every shape's own demo. The demos, the
resources, and the two business cases all exist for one reason: **to back a shape
and be the live proof it produces working UI.** A shape's distributed `templates/`
are *generated from* this repo's working source and kept byte-for-byte in sync, so
the catalogue never ships code the repo hasn't typechecked, built, and tested.

**Two modes of work — know which you're in:**

- **Authoring the substrate — the default here.** You're adding or fixing a
  *skill*, the platform layer, a gallery demo, or a business case *inside this
  repo*. Whatever you produce must (a) be real, working repo code — so it's
  verified and visible in the gallery — and (b) stay in lockstep with its
  distributed skill via `sync-skills`. **If you are editing files in this repo,
  you are almost certainly in this mode.** → see *Authoring a skill* below.
- **Porting out.** A *different* agent stands up a real product by scaffolding the
  clean base into a **new** project and *composing* it (scaffold → rebrand → pick a
  backend → add resources → add shapes). The base is demo-free + gallery-free, so
  there's nothing to strip. That workflow lives in `PORTING.md` and the
  `scaffold-dashboard` / `rebrand` / `add-backend-preset` / `add-crud-resource`
  skills — not here. Don't confuse "build a product" (port-out) with "maintain the substrate"
  (the work in this repo).

## The skill model — the most important convention

- **The repo source is the single source of truth.** A skill's bundled
  `templates/*` is a **generated copy** of a repo file, produced by
  `scripts/sync-skills.ts`. The UI shapes all live in **one** skill —
  `add-component` — whose templates are the flattened union of
  `COMPONENT_SOURCES` (a `Record<componentName, repoSourcePath[]>` in
  `sync-skills.ts`); each shape also has a hand-authored
  `add-component/references/<name>.md` (the "Add it / Foundation / Invariants /
  Verify" prose — **not** generated). Templates are a flat folder, basename only
  (a basename-collision guard fails the sync if two sources clash).
- **NEVER hand-edit anything under `templates/`.** Edit the repo source, then run
  `bun run sync-skills` to regenerate. `bun run sync-skills --check` is the
  **drift guard** — byte-for-byte compare, exits non-zero on any drift or missing
  source. Run it before finishing.
- **The gallery demo *is* the skill's test.** A skill's source is a real,
  self-contained, zero-config route/component the repo typechecks / builds /
  tests / renders in the Skills Gallery — so "does this skill produce working UI"
  is continuously proven. A skill whose demo doesn't render is not done.
- **`scripts/build-base.ts`** assembles the clean base bundle the
  `scaffold-dashboard` skill ships (the platform shell, with demo / scenario /
  gallery code stripped and the `clean/` overrides applied). Re-run
  `bun run build-base` after changing the platform layer or the `clean/` files.

## Authoring a shape (a component in `add-component`)

Adding a new UI shape means adding a **component** to the `add-component`
catalogue — not a new top-level skill. To add one:

1. **Build the demo in the repo**, self-contained and zero-config (local/static
   data, no Drizzle table): a route under `src/routes/_app/gallery/<demo>.tsx`,
   plus any small component under `src/components/…`, `src/infra/…`, or
   `src/lib/…`. Make it real, working code — that is both the proof and the test.
2. **Surface it in the Skills Gallery:** add a `SHAPES` entry in
   `src/routes/_app/gallery/index.tsx` (title / route / category / icon) and a
   sidebar item in the matching `Skills · …` group in `src/lib/sidebar-items.ts`.
3. **Register it for distribution:** add a `COMPONENT_SOURCES` entry in
   `scripts/sync-skills.ts` (in the matching category group) mapping the component
   name → its repo source path(s).
4. **Write `.claude/skills/add-component/references/<name>.md`** — the house
   format: **Add it** (`cp .claude/skills/add-component/templates/<file>` into a
   route/component, then rewire) · **Foundation it assumes** · **Invariants** ·
   **Verify**. Then add a one-line catalogue entry under the right category in
   `add-component/SKILL.md`. Keep it terse — the template carries the code.
5. **Generate + verify:** `bun run sync-skills`, then
   `bun run typecheck && bun run check && bun run test && bun run build && bun run sync-skills --check`.

**Operation skills** (`scaffold-dashboard`, `add-crud-resource`, `add-data-source`,
`add-backend-preset`, `rebrand`) ship **no
`templates/`**: they point at a canonical in-repo example (e.g. `features/products`,
`src/lib/auth-provider.ts`) and/or a command (`bun run create-resource`). They stay
their own slim `SKILL.md` skills (no `COMPONENT_SOURCES` entry). `add-tests` is the
one operation skill that still ships a `templates/` exemplar.

**Platform changes** (UI primitives, form system, charts, the `Repository` /
`AuthProvider` seams, the shell): edit the repo source, run the full suite, then
`bun run build-base` (and `bun run sync-skills` if a `MANIFEST` source changed).

## Conventions (prescriptive)

### Substrate & skill rules (the meta layer)

**ALWAYS**
- Treat the repo source as truth. After changing any file a component's
  `COMPONENT_SOURCES` maps, run `bun run sync-skills`, and finish with
  `bun run sync-skills --check` green.
- Keep every gallery demo **self-contained + zero-config** (local/static data, no
  Drizzle table) so it backs its shape and renders standalone.
- Add/remove a shape as a unit: the gallery route + its `SHAPES` entry + its
  `Skills · …` sidebar item + its `COMPONENT_SOURCES` entry + its
  `add-component/references/<name>.md` move together.
- Re-run `bun run build-base` after a platform-layer or `clean/` change so the
  `scaffold-dashboard` bundle stays current.

**NEVER**
- Hand-edit `.claude/skills/*/templates/*` — edit the repo source and re-sync.
- Ship a shape whose demo doesn't render/verify, or whose `COMPONENT_SOURCES`
  source is missing (`--check` will fail the build).

### App-code rules (the feature / demo code you write)

**ALWAYS**
- Call `requireUser()` first in every protected server-fn handler, and validate
  input with Zod via `.validator(...)`. Data crosses the client↔server boundary
  only through `createServerFn` — there is no manual fetch/REST layer.
- Keep list/sort/filter/page state in the URL (`validateSearch` +
  `useTableSearch`/`useResourceList`), not local `useState`. (Multi-row
  *selection* and dialog open-state are the exceptions — transient local state.)
- Wrap a `DataTable`/`CardList` page in a **full-height flex column**
  (`<div className="flex h-full flex-col gap-6">`, header as `shrink-0`) so the
  pagination bar pins to the page bottom (the shell sizes each page to the
  viewport). The generator emits this.
- Report mutations with a toast and route destructive actions through
  `useConfirm()`. Invalidate the resource's query keys on success.
- Use a `Repository` adapter in `server.ts` (never inline Drizzle/`fetch` in a
  resource). Import `drizzleRepository` from `@/infra/data/drizzle-repository`.
- Compose from the platform layers (form system, charts, `DataTable`/`CardList`,
  archetypes). Find the closest pattern in `PATTERNS.md` and copy it.
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

## The platform — what skills are carved from

The rest of this file documents the substrate the skills compose. It is accurate
reference, but secondary to the skill model above.

### Tech stack

- **Framework**: [TanStack Start](https://tanstack.com/start) — full-stack React on Vite + Nitro. Server logic runs in **server functions** created with `createServerFn` from `@tanstack/react-start`.
- **Routing**: [TanStack Router](https://tanstack.com/router) — file-based, type-safe routes under `src/routes/`. Route tree is generated into `src/routeTree.gen.ts` (do not edit by hand; `typecheck` runs `tsr generate` first).
- **Server state**: [TanStack Query](https://tanstack.com/query) — caching + mutations, SSR-integrated via `@tanstack/react-router-ssr-query`.
- **Tables**: [TanStack Table](https://tanstack.com/table) — headless, wrapped by the generic `DataTable` in `src/infra/table`.
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Drizzle ORM](https://orm.drizzle.team/) (`drizzle-orm/node-postgres`). Schema in `src/db/schema.ts`; client in `src/db/index.ts`. Migrations in `./drizzle` via `drizzle-kit`. **The database is the default backend, not a hard requirement**: with no `DATABASE_URL` the app boots on in-memory adapters (`bun dev`, no Docker). See `docs/backends.md`.
- **Auth**: [better-auth](https://www.better-auth.com/) — email + password, real hashed passwords; sessions in Postgres via the Drizzle adapter when `DATABASE_URL` is set, else better-auth's in-memory adapter. Reached through the **`AuthProvider` seam** (`src/lib/auth-provider.ts`) + the browser client (`src/lib/auth-client.ts`), so the auth backend is a swappable preset; better-auth config (cookies via the `tanstackStartCookies` plugin — must be the **LAST** plugin) is in `src/lib/auth.ts`. See `docs/backends.md`.
- **UI**: [shadcn/ui](https://ui.shadcn.com/) on **[`@base-ui/react`](https://base-ui.com/) (NOT Radix)**, in `src/components/ui`. **Tailwind CSS v4**, **Phosphor icons** (`@phosphor-icons/react`), light/dark via `next-themes`.
- **Charts**: Recharts. **Client state**: Zustand. **Validation**: Zod (v4).
- **Tooling**: **Bun** (package manager + script runtime), **Biome** (lint + format), **Vitest**. **TypeScript** strict, path alias `@/*` → `./src/*`. Dev server on port 3000.

### Routing & auth guard

- `__root.tsx` — HTML shell, head, providers (`next-themes`).
- `_app.tsx` — **auth-guarded layout** (the `DashboardShell`). Its `beforeLoad` calls `getSession()` and `throw redirect({ to: "/login" })` if there's no session; otherwise returns `{ user }` into the route context. All protected pages live under `src/routes/_app/`.
- `_auth.tsx` — public auth layout; redirects already-authenticated users to `/`. Children: `login`, `register`.
- `api/auth/$.ts` — mounts the auth provider's HTTP handler for `GET`/`POST`.

Auth is reached through a seam so the backend is swappable (`docs/backends.md`):
- `src/lib/auth-provider.ts` — the **`AuthProvider`** interface (`getSession(headers)` / `handler(request)`) + the active `authProvider` (better-auth by default). Server-only.
- `getSession()` (`src/lib/auth-server.ts`) — a `createServerFn` wrapping `authProvider.getSession`; use in route `beforeLoad`/loaders.
- `requireUser()` (`src/lib/require-user.ts`) — asserts an authenticated user; **call at the top of every mutating/protected server-fn handler**. Throws `"UNAUTHORIZED"`.
- The browser auth client (`signIn`, `signUp`, `signOut`, `useSession`) is in `src/lib/auth-client.ts`.

### The resource pattern

Every data resource is a self-contained folder under `src/features/<name>/`, paired
with a route under `src/routes/_app/<name>.tsx` that renders the generic `DataTable`.
**`products` is the canonical example — copy it.** A resource folder contains:

| File | Responsibility |
| --- | --- |
| `schema.ts` | Zod schemas + inferred types: input, update, and list-params (page/pageSize/search/sort/filter). |
| `server.ts` | `createServerFn` handlers (`list*`, `get*`, `create*`, `update*`, `delete*`). Each calls `requireUser()`, validates via `.validator(...)`, and delegates to a **`Repository` adapter** — `drizzleRepository(table, { searchColumns, sortColumns, filterColumns, defaultSort, updatedAtKey })` for Postgres, or `restRepository`/`graphqlRepository`/`memoryRepository`. Returns `{ rows, total }`. |
| `queries.ts` | TanStack Query glue: a `*Keys` factory, a `*ListQuery(params)` returning `queryOptions`, and `useCreate*`/`useUpdate*`/`useDelete*` hooks that invalidate the resource's keys on success. |
| `columns.tsx` | `ColumnDef[]` factory taking a context (`onEdit`/`onDelete`). Uses shared cells from `@/infra/ui` (`StatusChip`, `ActionMenu`). |
| `config.ts` | Filter definitions (`FilterConfig[]`) + table config (search placeholder, page-size options, empty message). |

A Drizzle-backed resource adds its table to `src/db/schema.ts`. A resource can also
be **memory-backed** (`memoryRepository` + a `demo-data.ts`, no table) — that is how
the business-case scenarios run zero-config.

### The generic `DataTable`

`src/infra/table/DataTable.tsx` is a **fully-controlled, server-driven** table. The
page owns list state — page/pageSize/search/filter/sort synced to the URL via
`useTableSearch` (only multi-row selection + dialog state are local `useState`) — and
passes it down. The table uses `manualPagination`/`manualSorting`/`manualFiltering`,
and composes `TableToolbar` + `TablePaginationControls`. The body flexes to fill and
scrolls internally, so the pagination bar pins to the bottom **when the page wraps it
in a full-height flex column** (see the App-code rules). Reference wiring (incl. the
create/edit dialog): `src/routes/_app/products.tsx`. `CardList` (`src/infra/list`) is
the card-grid counterpart with the same plumbing (`useResourceList`).

### Platform layers (compose from these — don't reinvent)

- **Atoms** (`src/components`, `src/config`): the form system (`@/components/form` — TanStack Form + zod; `TextField`/`NumberField`/`SelectField`/`TextareaField`/`SubmitButton`/`FormError`), toast (`@/lib/toast` → sonner), `useConfirm()` (`@/components/ui/confirm-dialog`), chart components (`@/components/charts` — `StatCard`/`ChartCard`/`AreaChart`/`BarChart`/`PieChart`, CSS-var themed), and `appConfig` (`src/config/app.ts` — the single rebrand surface: name/logo/nav/theme).
- **Data access** (`src/infra/data`): the `Repository<T, TInput>` interface + `drizzleRepository` / `restRepository` / `graphqlRepository` / `memoryRepository` (zero-config default) over `ListParams`/`ListResult`. A resource binds an adapter in `server.ts`, typically via `hasDatabase` (`@/lib/backend`). See `docs/data-adapters.md`.
- **List views** (`src/infra/table`, `src/infra/list`): `DataTable` (server-driven, URL-synced, debounced search, opt-in bulk select) and `CardList` + `useResourceList`.
- **Page archetypes**: CRUD table (`products`), Detail/Show (`products_.$id.tsx` + `DescriptionList`), Master-detail split (`orders.tsx` + `orders.$id.tsx`), Card/grid list (`posts`). Each is a component in `add-component` (`add-detail-page`, `add-master-detail`, `add-card-list`, …); `add-crud-resource` is a standalone operation skill. Catalogue: `PATTERNS.md`.

### Sidebar, Skills Gallery & business cases

Navigation is `src/lib/sidebar-items.ts` (`mainMenuItems`, `bottomMenuItems`), surfaced
via `appConfig.nav`. Two halves:

- **Business cases** — two complete back-offices that *compose* the shapes into real
  verticals: **E-commerce** (`/`, products / orders / customers / refunds + store
  dashboard + blog) and **Sales (CRM)** (`/crm/*`: forecast / pipeline kanban /
  contacts / companies). `products` and `orders` are real Drizzle resources (with an
  in-memory fallback); the rest are memory-backed. These double as the live demos for
  the foundational archetypes — the `add-crud-resource` operation skill plus the
  `add-detail-page` / `add-master-detail` / `add-card-list` / `add-chart-page`
  components of `add-component`. They live only in this repo as proof — the
  `scaffold-dashboard` base ships without them (`build-base` strips them).
- **Skills Gallery** — one entry per shape, grouped (`Skills Gallery · Overview`, then
  `Skills · Forms` / `Lists & tables` / `Rich views` / `Detail & pages` / `Display &
  feedback`), each linking to that shape's demo under `/gallery/*` (every shape is a
  component in `add-component`). The Overview (`gallery/index.tsx`) is a tabbed
  catalogue of every shape (incl. variants not pinned to the sidebar). Repo-only
  too — stripped from the scaffold base. Full menu: `docs/gallery-catalogue.md`.

Anchors: generated CRUD resources insert at `// create-resource:anchor` (in the first
business group); new business-case groups go above `// gallery:anchor`; the `Skills · …`
groups stay last.

## How to add a resource (an app task)

1. Add a Drizzle table to `src/db/schema.ts`; run `bun run db:generate` then `bun run db:migrate`. *(Or skip the table and bind `memoryRepository` for a zero-config, in-memory resource.)*
2. Create `src/features/<name>/` (`schema`, `server`, `queries`, `columns`, `config`) — copy from `products`.
3. Add a route `src/routes/_app/<name>.tsx` wiring `DataTable` — copy from `products.tsx`.
4. Add a sidebar entry in `src/lib/sidebar-items.ts`.

Or run `bun run create-resource <name>` to scaffold all of the above (it also appends
the Drizzle table); then customise the fields and migrate. Walkthrough: `docs/resources.md`.

## Commands

- `bun run dev` — dev server (port 3000; zero-config if no `DATABASE_URL`).
- `bun run build` / `start` — production build / run Nitro server.
- `bun run check` / `lint` / `format` — Biome. `bun run typecheck` — `tsr generate` + `tsc --noEmit`. `bun run test` — Vitest.
- `bun run sync-skills` / `sync-skills --check` — regenerate skill `templates/` from repo source / verify in sync (the drift guard).
- `bun run build-base` — reassemble the `scaffold-dashboard` base bundle.
- `bun run create-resource <name>` — scaffold a CRUD resource.
- `bun run db:up` / `db:down` / `db:generate` / `db:migrate` / `db:push` / `db:studio` / `db:seed` — Postgres (Docker) + Drizzle.

See `README.md` for setup, `PATTERNS.md` for the shape catalogue, `PORTING.md` to start
a real product, and `docs/{resources,data-adapters,backends,gallery-catalogue}.md`.
