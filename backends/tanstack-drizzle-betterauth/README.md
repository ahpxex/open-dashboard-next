# Preset: TanStack Start + Drizzle + better-auth (the in-process default)

This is the **default backend** — and it is the dashboard repo itself. There is no
separate service to stand up: data and auth run **in-process** inside TanStack Start
server functions. Choosing this preset means "keep the scaffold's own backend".

It is the reference every other preset is measured against, so its pieces are documented
here rather than copied (they already live, typechecked and tested, in the repo).

## What backs what

| Concern | Where | Adapter / provider |
| --- | --- | --- |
| Business data | each resource's `src/features/<name>/server.ts` | `drizzleRepository` (Postgres) with a `memoryRepository` fallback |
| Auth (server) | `src/lib/auth-provider.ts` → `src/lib/auth.ts` | `betterAuthProvider` (better-auth, email + password) |
| Auth (browser) | `src/lib/auth-client.ts` | better-auth React client |

Canonical files to copy when you grow this preset:

- **A resource**: `src/features/products/` (`schema.ts`, `server.ts`, `queries.ts`,
  `columns.tsx`, `config.ts`) + its route `src/routes/_app/products.tsx`. Or run
  `bun run create-resource <name>` to scaffold all of it. See the `add-backend` skill
  §"Add a CRUD resource".
- **The Drizzle table**: appended to `src/db/schema.ts`.
- **Auth config**: `src/lib/auth.ts` (better-auth + the Drizzle/in-memory adapter pick).

## Zero-config vs. Postgres

- **No `DATABASE_URL`** → in-memory adapters for both data (`memoryRepository` over each
  resource's `demo-data.ts`) and auth (better-auth in-memory). `bun dev`, no Docker.
- **`DATABASE_URL` set** → Postgres via Drizzle for both. `bun run db:up` then
  `bun run db:generate && bun run db:migrate`.

See `docs/backends.md` and `.env.example` below.

## Run

```bash
bun install
bun run dev            # http://localhost:3000  (zero-config, in-memory)
# or, on Postgres:
cp .env.example .env   # set DATABASE_URL + BETTER_AUTH_SECRET
bun run db:up && bun run db:generate && bun run db:migrate
bun run dev
```

## Verify

Covered by the repo's own suite: `bun run typecheck && bun run check && bun run test &&
bun run build`. The login flow and the `products` resource are the live proof.
