# CLAUDE.md

Your back-office app, scaffolded from the **Open Dashboard** platform — a real
full-stack starter on **TanStack Start** + **Drizzle ORM / PostgreSQL** +
**better-auth**. The platform shell (UI, form system, charts, the `DataTable` /
`CardList` infra, the data + auth seams, the routing shell) is in place; the shell
ships with **no resources yet** — you build the product by **composing screens with
the `add-*` skills** (`add-crud-resource`, `add-detail-page`, `add-master-detail`,
`add-card-list`, `add-chart-page`, `add-form`, `add-kanban`, `add-billing`, `add-rbac`,
…). This file is the app's architecture + conventions.

It runs **zero-config**: `bun install && bun run dev` boots on in-memory adapters
(no Docker, no Postgres). Set `DATABASE_URL` to use Postgres; both the data
(`Repository`) and auth (`AuthProvider`) backends are swappable presets — see the
`add-backend-preset` skill.

## Tech stack

- **[TanStack Start](https://tanstack.com/start)** (Vite + Nitro) — server logic in `createServerFn` server functions.
- **TanStack Router** — file-based, type-safe routes under `src/routes/` (`routeTree.gen.ts` is generated; don't edit).
- **TanStack Query** (server state) · **TanStack Table** (wrapped by the generic `DataTable`).
- **Drizzle ORM + PostgreSQL** (`src/db/schema.ts`); in-memory adapters when there's no `DATABASE_URL`.
- **better-auth** — email + password, reached through the `AuthProvider` seam (`src/lib/auth-provider.ts`).
- **shadcn/ui on `@base-ui/react` (NOT Radix)**, **Tailwind v4**, **Phosphor** icons, **Recharts**, **Zustand**, **Zod**.
- **Bun**, **Biome**, **Vitest**, strict **TypeScript**, `@/*` → `./src/*`. Dev server on port 3000.

## Architecture

### Routing & auth guard
- `_app.tsx` — auth-guarded shell; its `beforeLoad` calls `getSession()` and `throw redirect({ to: "/login" })` when there's no session. Protected pages live under `src/routes/_app/`.
- `_auth.tsx` — public auth layout (login / register). `api/auth/$.ts` — the auth HTTP handler.
- `requireUser()` (`src/lib/require-user.ts`) — call at the top of **every** protected / mutating server-fn handler.

### The resource pattern
Each data resource is a self-contained folder under `src/features/<name>/`
(`schema.ts` / `server.ts` / `queries.ts` / `columns.tsx` / `config.ts`), paired with
a route under `src/routes/_app/<name>.tsx` that renders the generic `DataTable`.
**`bun run create-resource <name>` scaffolds the whole vertical** (the generator
carries the canonical pattern + the sidebar entry); then customise the fields and
migrate. Every `server.ts` handler calls `requireUser()`, validates via
`.validator(...)`, and delegates to a **`Repository` adapter** — returning
`{ rows, total }`.

### The two seams (swappable backend)
- **Data** — `Repository<T, TInput>` (`src/infra/data`) with `drizzle` / `rest` / `graphql` / `memory` adapters. A resource binds one in its `server.ts`.
- **Auth** — `AuthProvider` (`src/lib/auth-provider.ts`, server-only) + the browser client (`src/lib/auth-client.ts`).

Swap either to point at Supabase, an external REST/GraphQL API, or a different SQL
engine — the rest of the app is unchanged. Use the `add-backend-preset` skill.

### Platform layers (compose from these — don't reinvent)
The form system (`@/components/form` — `TextField`/`NumberField`/`SelectField`/
`TextareaField`/`SubmitButton`/`FormError`), toast (`@/lib/toast`), `useConfirm()`
(`@/components/ui/confirm-dialog`), chart components (`@/components/charts`),
`DataTable` / `CardList` (`src/infra/table`, `src/infra/list`), and `appConfig`
(`src/config/app.ts` — the single rebrand surface: name / logo / nav / theme).

## Conventions (prescriptive)

**ALWAYS**
- Call `requireUser()` first in every protected server-fn handler, and validate
  input with Zod via `.validator(...)`. Data crosses the client↔server boundary
  only through `createServerFn` — there is no manual fetch/REST layer.
- Keep list/sort/filter/page state in the URL (`validateSearch` +
  `useTableSearch`/`useResourceList`), not local `useState` (multi-row selection +
  dialog open-state are the exceptions — transient local state).
- Wrap a `DataTable`/`CardList` page in a **full-height flex column**
  (`<div className="flex h-full flex-col gap-6">`, header as `shrink-0`) so the
  pagination bar pins to the page bottom. The generator emits this.
- Report mutations with a toast and route destructive actions through
  `useConfirm()`. Invalidate the resource's query keys on success.
- Use a `Repository` adapter in `server.ts` (never inline Drizzle/`fetch`). Import
  `drizzleRepository` from `@/infra/data/drizzle-repository`.
- Use the `@/*` alias. Before finishing, run `bun run typecheck && bun run check &&
  bun run test` (and `bun run build` for infra changes).

**NEVER**
- Import `@/db` (or the Drizzle adapter) from a client-reachable module — it leaks
  `pg` into the browser. Adapters/secrets stay in server fns only.
- Hand-edit `src/routeTree.gen.ts` (it's generated).
- Hardcode the brand — change `src/config/app.ts`.
- Reintroduce Next.js, Hero UI, TypeORM, or Refine. shadcn/ui here is built on
  `@base-ui/react`, **not** Radix.
- Sort by raw user input — use the adapter's `sortColumns` whitelist.

## How to add a resource

```bash
bun run create-resource <name>              # feature + route + Drizzle table + sidebar entry
bun run db:generate && bun run db:migrate   # if you're on Postgres
```

Then customise the fields. Or compose a different shape with the matching `add-*`
skill (detail page, master-detail, card list, kanban, chart page, settings, …).

## Commands

- `bun run dev` — dev server (port 3000; zero-config if no `DATABASE_URL`).
- `bun run build` / `start` — production build / run the Nitro server.
- `bun run check` / `lint` / `format` — Biome. `bun run typecheck` — `tsr generate` + `tsc --noEmit`. `bun run test` — Vitest.
- `bun run create-resource <name>` — scaffold a CRUD resource.
- `bun run db:up` / `db:down` / `db:generate` / `db:migrate` / `db:push` / `db:studio` / `db:seed` — Postgres (Docker) + Drizzle.
