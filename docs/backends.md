# Backends — data + auth as swappable presets

This template is a **backend-agnostic admin substrate**, not a starter welded to
one database. The portable layer — page archetypes, the form/table/chart system,
query conventions, the agent skills — is written against two seams and never
against a specific backend. Pick a backend per project by swapping what sits
behind those seams; everything above stays the same.

## The two seams

| Concern | Seam | Default | Swap point |
| --- | --- | --- | --- |
| **Business data** (your resources) | [`Repository<T, TInput>`](../src/infra/data/repository.ts) | `drizzleRepository` (Postgres); `memoryRepository` when no DB | each resource's `server.ts` |
| **Auth** (server) | [`AuthProvider`](../src/lib/auth-provider.ts) | `betterAuthProvider` | the `authProvider` binding |
| **Auth** (browser) | [`@/lib/auth-client`](../src/lib/auth-client.ts) | better-auth React client | reimplement that file |

### Two classes of data

- **Platform data** — users, sessions, later RBAC. Owned by the **auth preset**;
  must persist reliably. Swap via `AuthProvider` + `auth-client`.
- **Business data** — your resources (products, orders, …). Owned by each
  resource. Swap via the `Repository` adapter in `server.ts`.

Conflating the two is what makes people think "the template forces Postgres." It
doesn't: business data is backend-agnostic by construction, and the platform
backend is a default you can replace.

## Zero-config default

With **no `DATABASE_URL`** the app boots on in-memory presets:

- Auth uses better-auth's in-memory adapter (`@/lib/auth.ts` picks it via
  `hasDatabase`). Accounts reset on server restart; register on first run.
- Resources use `memoryRepository` with the seed in `features/<name>/demo-data.ts`.

So `bun dev` works with no Docker/Postgres — build and demo the UI before choosing
a backend. `@/lib/backend.ts` exposes `hasDatabase`; it pulls in no DB client, so
it is safe to read from a client-reachable `server.ts`.

Set `DATABASE_URL` (copy `.env.example` to `.env`, then `bun run db:up`) to switch
the whole stack onto Postgres + Drizzle + better-auth.

## Swapping the backend

Use the **`add-backend-preset`** skill — it has the step-by-step plus copy-ready
`AuthProvider` templates for Supabase and an external JWT API. In short:

- **External REST/GraphQL data** → bind `restRepository` / `graphqlRepository` in
  the resource's `server.ts` (see [`data-adapters.md`](./data-adapters.md) and the
  `add-data-source` skill). Nothing else in the vertical changes.
- **Supabase / Clerk / external-API auth** → implement an `AuthProvider`, point
  `authProvider` at it, and reimplement `@/lib/auth-client`.

### A different SQL engine (MySQL / SQLite / Turso)

Drizzle is multi-dialect, so you keep `drizzleRepository` and change only the
preset plumbing:

1. `src/db/index.ts` — swap the driver (`drizzle-orm/mysql2`, `…/better-sqlite3`, …).
2. `src/db/schema.ts` — `mysqlTable` / `sqliteTable` + that dialect's column types.
3. `src/lib/auth.ts` — better-auth `provider: "mysql" | "sqlite"`.
4. `drizzle.config.ts` — the `dialect`.
5. Make `drizzleRepository`'s case-insensitive search dialect-aware (it uses
   Postgres `ilike` today).

## Invariants (unchanged regardless of backend)

- Data crosses the boundary only through `createServerFn`, each handler calling
  `requireUser()` and validating input with Zod.
- `requireUser` / the `_app` guard / route context all speak the normalized
  `AuthSession` (`{ user: { id, email, name } }`), never a vendor session shape.
- Adapters/SDK clients and secrets stay server-side — never statically imported
  from a client-reachable module.
