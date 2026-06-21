# `backends/` — runnable backend presets for the `add-backend` skill

This directory is the **in-repo source of truth** for the backend templates that the
[`add-backend`](../.claude/skills/add-backend) skill ships. `bun run sync-skills`
copies each preset tree into `.claude/skills/add-backend/templates/<preset>/` verbatim,
and `bun run sync-skills --check` is the drift guard — exactly like the rest of the
skill catalogue, just for whole directory trees instead of single files.

Each preset is a **standalone, runnable service** (its own toolchain, its own tests)
that the dashboard frontend reaches through its two seams — `Repository` (data) and
`AuthProvider` (auth) — **without changing any page, query, table, or form**. Picking a
preset is choosing the project's backend; the frontend is unchanged.

## The presets

| Preset | Stack | Frontend wiring | Verified here |
| --- | --- | --- | --- |
| `tanstack-drizzle-betterauth` | TanStack Start server fns + Drizzle + better-auth | **in-process** (the repo's own default) | ✅ by the repo build |
| `hono-drizzle-betterauth` | Hono + Drizzle + better-auth (standalone TS service) | `restRepository` + external-JWT `AuthProvider` | ✅ install + typecheck + vitest + live smoke |
| `fastapi-sqlalchemy-jwt` | FastAPI + SQLAlchemy + JWT (standalone Python service) | `restRepository` + external-JWT `AuthProvider` | ✅ uv install + pytest + live smoke |
| `supabase` | Supabase Postgres + Auth (BaaS) | `supabaseRepository` + Supabase `AuthProvider` | ⚠️ SQL/RLS + typecheck; full E2E needs Docker/a project |

The two **HTTP-API presets** (`hono`, `fastapi`) speak one shared wire contract
([`CONTRACT.md`](./CONTRACT.md)), so a **single** frontend wiring (the external-JWT
`AuthProvider` + a `restRepository` binding) serves both. `supabase` is consumed through
Supabase's own PostgREST + Auth surface and ships its own thin adapter.

The `tanstack-drizzle-betterauth` preset is the repo itself — it has no standalone
service. Its template is a pointer + the canonical files (`src/features/products`,
`src/lib/auth.ts`); see its README.

## Zero-config

Every HTTP-API preset boots with **no external infrastructure** (SQLite + a dev JWT
secret) so a clean checkout runs with one install + one run command — mirroring the
frontend's zero-config `bun dev`. Set `DATABASE_URL` to move onto Postgres. See
[`CONTRACT.md` §3](./CONTRACT.md).

## Working here

- **Edit the source here, never the skill template.** `backends/<preset>` is the
  source; `.claude/skills/add-backend/templates/<preset>` is generated. After any
  change run `bun run sync-skills`, and finish with `bun run sync-skills --check` green.
- These projects are **excluded from the root toolchain** (tsconfig / biome / vitest):
  each has its own. Verify a preset inside its own directory (or a copied-out test
  project), not via the repo's `bun run typecheck`.
- The root `.gitignore` ignores anything installed/built under `backends/**`
  (`node_modules`, `.venv`, `*.db`, …) — commit only the template source.
