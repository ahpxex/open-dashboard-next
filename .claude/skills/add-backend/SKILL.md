---
name: add-backend
description: Everything about the data layer — pick one of six ready-to-run backend templates (TanStack Start + Drizzle + better-auth, Hono + Drizzle + better-auth, Hono + Prisma + better-auth, Hono + Drizzle + Auth.js/NextAuth, FastAPI + SQLAlchemy + JWT, Supabase) and wire the frontend to it through the Repository + AuthProvider seams; scaffold a CRUD resource (Postgres table + server fns + query hooks + DataTable page + create/edit dialog + sidebar entry); bind or swap one resource's data source (Drizzle / REST / GraphQL / in-memory); or re-point the whole app's data + auth at a different backend. Use when adding a data entity or pointing the app at a backend other than the default Postgres + better-auth.
---

# Add a backend (resources, data sources & presets)

The app is **backend-agnostic by design**: it reaches data and auth only through
two seams, so adding a resource, swapping one resource's data source, or
re-pointing the whole app at a different backend are all **localized** operations.

**Routing rule:** use `add-backend` whenever a screen needs its own **data** (a new
entity/table, or a different backend); use `add-component` when composing UI on top
of data that already exists.

| Concern | Seam | Default preset | Swap point |
| --- | --- | --- | --- |
| **Business data** (resources) | `Repository<T, TInput>` (`@/infra/data/repository`) | Postgres via `drizzleRepository`; in-memory when no DB | each resource's `server.ts` binding |
| **Auth** (server) | `AuthProvider` (`@/lib/auth-provider`) | better-auth (`betterAuthProvider`) | the `authProvider` binding |
| **Auth** (browser) | `@/lib/auth-client` | better-auth React client | reimplement that one file |

Zero-config (`bun dev`, no `DATABASE_URL`) already runs on in-memory presets, so you
can build UI before wiring a real backend. Full guides: `docs/data-adapters.md`,
`docs/backends.md`.

## Backend presets — ready-to-run templates

Six **runnable backend templates** ship in this skill's `templates/<preset>/` (generated
from the repo's `backends/` source and contract-tested — `templates/<preset>/README.md`
+ a shared `CONTRACT.md`). Pick one as the project's backend; each connects to the
dashboard frontend through the two seams above — **no page, query, table, or form
changes** — and each is independently verified.

| Preset | Stack | Frontend wiring | Reference |
| --- | --- | --- | --- |
| `tanstack-drizzle-betterauth` | TanStack Start server fns + Drizzle + better-auth (in-process — the default) | none — it *is* the scaffold | `references/tanstack-drizzle-betterauth.md` |
| `hono-drizzle-betterauth` | Hono + Drizzle + better-auth (standalone TS service) | `restRepository` + `remoteBetterAuthProvider` | `references/hono-drizzle-betterauth.md` |
| `hono-prisma-betterauth` | Hono + Prisma + better-auth (standalone TS service) | `restRepository` + `remoteBetterAuthProvider` (same as Drizzle) | `references/hono-prisma-betterauth.md` |
| `hono-drizzle-authjs` | Hono + Drizzle + Auth.js / NextAuth v5 (standalone TS service) | `restRepository` + `remoteAuthjsProvider` + `authjs` client | `references/hono-drizzle-authjs.md` |
| `fastapi-sqlalchemy-jwt` | FastAPI + SQLAlchemy + JWT (standalone Python service) | `restRepository` + `externalJwtAuthProvider` | `references/fastapi-sqlalchemy-jwt.md` |
| `supabase` | Supabase Postgres + Auth (BaaS — SQL + config) | `supabaseRepository` + Supabase `AuthProvider` (copy-ready) | `references/supabase.md` |

The HTTP-API presets (the `hono-*` services + `fastapi`) all speak one shared wire
contract, so their frontend auth providers ship **pre-wired and typechecked** in the base
under `src/lib/auth-providers/` (`externalJwtAuthProvider`, `remoteBetterAuthProvider`,
`remoteAuthjsProvider`) — activating is a one-line swap. Supabase needs the Supabase SDKs,
so its wiring ships as copy-ready files in `templates/supabase/frontend-wiring/`.

> Stack matrix: framework (TanStack / Hono / FastAPI / Supabase) × ORM (Drizzle / Prisma /
> SQLAlchemy) × auth (better-auth / Auth.js / custom-JWT / Supabase). The presets are the
> idiomatic, verified combinations — not a blind cartesian product.

**To stand up a preset:**
1. Read `references/<preset>.md` (Add it / Foundation / Invariants / Verify).
2. Copy the template out as the service (`cp -R templates/<preset> <dest>`); follow its
   README to run it (zero-config: SQLite + a dev secret, one install + one run command).
3. Wire the frontend: bind the resource's `server.ts` to the preset's `Repository`
   adapter (§2) and point `authProvider` at the preset's `AuthProvider` (§3).
4. Verify end-to-end (the reference's Verify block).

The numbered sections below are the building blocks these presets compose: add a resource
(§1), bind/swap a data source (§2), swap the auth preset (§3).

## 1. Add a CRUD resource

The CRUD table is the base archetype. `products` is the canonical reference;
`orders` is a generated example.

1. **Generate the vertical** (table + feature + route + sidebar entry, auto-formatted):
   ```bash
   bun run create-resource <plural-name>   # e.g. customers
   ```
   This creates `src/features/<name>/{schema,server,demo-data,queries,columns,config}.ts(x)`
   and the route `src/routes/_app/<name>.tsx`, appends a Drizzle table to
   `src/db/schema.ts`, and inserts a sidebar item. Like `products`, the generated
   `server.ts` binds `drizzleRepository` when `DATABASE_URL` is set and falls back
   to `memoryRepository` over `demo-data.ts` otherwise — so the new resource runs
   under zero-config `bun dev` (no database) before you ever migrate.
2. **Customise the fields** in `src/db/schema.ts` (the appended `pgTable`) and in
   `src/features/<name>/schema.ts` (the zod input / form / list-params schemas).
   Keep numeric form fields non-coercing in `*FormSchema` (input must match the
   form value type); the server `*InputSchema` may coerce. Filter params that can
   be numeric must use `z.coerce.string()` (the router JSON-parses search params).
3. **Adjust** `columns.tsx` (cells, sortable columns), `config.ts` (filters,
   search placeholder), the `server.ts` repository config (`searchColumns` /
   `sortColumns` / `filterColumns` on the drizzle branch, and the matching
   `searchFields` / `sortFields` / `filterFields` on the memory branch), and the
   seed rows in `demo-data.ts`.
4. **Migrate** (only on Postgres — zero-config dev needs no DB):
   `bun run db:generate && bun run db:migrate`.
5. **Verify**: `bun run typecheck && bun run check && bun run test`, then open
   `/<name>` (it lists the `demo-data.ts` rows with no DB).

### Resource invariants (must hold)

- Every server-fn handler calls `requireUser()` first and validates input via
  `.validator((data) => zodSchema.parse(data))` (an arrow wrapper, not a bare
  `zodSchema.parse` method reference).
- List state lives in the URL (`validateSearch` + `useTableSearch`); never local
  `useState`.
- Mutations show a toast and invalidate the resource's query keys; deletes go
  through `useConfirm()`.
- The repository binding lives in `server.ts` (server-only): `drizzleRepository`
  from `@/infra/data/drizzle-repository` behind `hasDatabase`, with a
  `memoryRepository` fallback for zero-config dev — never imported from a client
  component.
- The page wraps `DataTable` in a **full-height flex column** —
  `<div className="flex h-full flex-col gap-6">` with the header as `shrink-0` —
  so the pagination bar pins to the bottom (the shell sizes each page to the
  viewport). The generator emits this; keep it.

## 2. Bind / swap a resource's data source

Every page archetype is written against `Repository<T, TInput>`
(`src/infra/data/repository.ts`), so swapping a resource's backend touches only its
`server.ts` binding — `queries.ts`, `columns.tsx`, the table/detail/form, and the
route do not change.

**Adapters:**
- **Drizzle (Postgres)** — `drizzleRepository(table, config)` from
  `@/infra/data/drizzle-repository` (import directly; server-only). Backs
  `products`/`orders`.
- **In-memory** — `memoryRepository(seed, config)`. The zero-config default; backs
  every demo when `DATABASE_URL` is unset.
- **REST** — `restRepository({ baseUrl, path, map, … })` from `@/infra/data`. Backs
  `posts` (jsonplaceholder). Defaults target json-server
  (`_page`/`_limit`/`_sort`/`_order`/`q` + `x-total-count`); override `params` /
  `totalHeader` for other shapes.
- **GraphQL** — `graphqlRepository({ endpoint, map, operations })` from
  `@/infra/data`. Each op supplies a document + variable builder + extractor.

**To back a resource with REST/GraphQL** (no DB table needed):
1. Define the resource's type + zod schemas.
2. In `server.ts`, build the repository with the right adapter and a `map` from the
   raw API record to your type; wrap each op in a `createServerFn` handler that
   calls `requireUser()` (the fetch stays server-side, so API keys never reach the
   client):
   ```ts
   export const widgetsRepository = restRepository<Widget, WidgetInput>({
     baseUrl: process.env.WIDGETS_API_URL!,
     path: "/widgets",
     map: (raw) => ({ ...raw }),
   });
   ```
3. Map the resource's flat list params to the repository's `filters`
   (`toListParams`). Numeric filter params → `z.coerce.string()`.

### Data-source invariants

- Adapters run only inside server fns. The `@/infra/data` barrel is
  isomorphic-safe (no `@/db`); the Drizzle adapter is imported from its own path.
- Always provide a unit test mocking the transport (fetch / db) — see
  `rest-repository.test.ts`, `graphql-repository.test.ts`, `drizzle-repository.test.ts`.

## 3. Swap the whole-app backend + auth preset

Two classes of data, two different rules:
- **Business data** (your resources) — swap per resource via the `Repository`
  adapter in `server.ts` (section 2).
- **Platform data** (users/sessions, later RBAC) — owned by the *auth preset*; swap
  it via `AuthProvider` (server) + `@/lib/auth-client` (browser).

Implement `AuthProvider` and point `authProvider` at it. The contract:

```ts
export interface AuthProvider {
  getSession(headers: Headers): Promise<AuthSession | null>; // AuthSession = { user: { id; email; name; image? } }
  handler(request: Request): Promise<Response>;              // serves /api/auth/*
}
```

> **For the bundled presets these now ship as real files — activate, don't hand-write.**
> `src/lib/auth-providers/external-jwt.ts` (`externalJwtAuthProvider`, custom-JWT like the
> FastAPI preset) and `src/lib/auth-providers/remote-better-auth.ts`
> (`remoteBetterAuthProvider`, remote better-auth like the Hono preset) are pre-wired and
> typechecked; the Supabase provider is copy-ready in
> `templates/supabase/frontend-wiring/auth-provider.ts`. The examples below show the shape
> behind those files.

### Example: Supabase auth provider

```ts
// src/lib/auth-provider.ts (replace betterAuthProvider). bun add @supabase/ssr
import { createServerClient, parseCookieHeader } from "@supabase/ssr";

export const supabaseAuthProvider: AuthProvider = {
  async getSession(headers) {
    const cookies = parseCookieHeader(headers.get("cookie") ?? "");
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookies } },
    );
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? "",
        name: data.user.user_metadata?.name ?? data.user.email ?? "",
      },
    };
  },
  // Supabase auth runs client-side; no /api/auth/* routes to serve.
  handler: async () => new Response("Not found", { status: 404 }),
};

export const authProvider: AuthProvider = supabaseAuthProvider;
```

Then reimplement `@/lib/auth-client` with Supabase's browser client, exporting the
same `signIn` / `signUp` / `signOut` / `useSession` surface the auth pages use.

### Example: external-API (JWT) auth provider

```ts
// src/lib/auth-provider.ts (replace betterAuthProvider)
export const externalApiAuthProvider: AuthProvider = {
  async getSession(headers) {
    const cookie = headers.get("cookie") ?? "";
    const token = /(?:^|;\s*)session=([^;]+)/.exec(cookie)?.[1];
    if (!token) return null;
    const res = await fetch(`${process.env.AUTH_API_URL}/me`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const u = await res.json();
    return { user: { id: String(u.id), email: u.email, name: u.name } };
  },
  // Proxy login/logout to the upstream API (set the session cookie on success).
  handler: async (request) => {
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    return fetch(
      `${process.env.AUTH_API_URL}/auth${new URL(request.url).pathname.replace("/api/auth", "")}`,
      {
        method: request.method,
        headers: request.headers,
        // Buffer the body before forwarding. Passing the raw `request.body`
        // ReadableStream to Node/undici's fetch requires `duplex: "half"` and
        // still can't be retried; reading it to a string sidesteps both.
        body: hasBody ? await request.text() : undefined,
      },
    );
  },
};

export const authProvider: AuthProvider = externalApiAuthProvider;
```

A different SQL engine (MySQL/SQLite/Turso) needs no preset swap — Drizzle supports
them; see `docs/backends.md` for the files to touch.

### Preset invariants

- The app reaches auth ONLY via `authProvider` (server) and `@/lib/auth-client`
  (browser). Never call a specific auth SDK from a route or component.
- `getSession` returns the normalized `AuthSession` (`{ user: { id, email, name } }`)
  so `requireUser`, the `_app` guard, and the route context are backend-neutral.
- Keep the server seam server-only: `auth-provider.ts` may import DB/SDK clients, so
  it must only be reached from `require-user`, the api route, and the dynamic import
  in `auth-server` — never statically from a client-reachable module.

## Verify

`bun run typecheck && bun run check && bun run test` (and `bun run build` for an
auth-preset swap), then `bun run dev`: open `/<name>` and confirm
list/paginate/filter/search work; for an auth swap, an unauthenticated request to
`/` redirects to `/login`, sign-in works, and a protected page loads its data.
