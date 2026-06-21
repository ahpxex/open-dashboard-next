# Preset: Hono + Drizzle + Auth.js (NextAuth v5) — standalone TS service

A **standalone, runnable backend service** for the open-dashboard frontend. It speaks the
shared wire contract in [`../CONTRACT.md`](../CONTRACT.md):

- **Data** — the `products` resource as a **json-server-dialect REST API**
  (`_page`/`_limit`/`_sort`/`_order`/`q`/`status` + an `X-Total-Count` header),
  backed by Drizzle.
- **Auth** — **Auth.js (NextAuth) v5** with a **Credentials** provider hosted at
  `/api/auth/*` (CONTRACT §2c) via `@hono/auth-js` (`initAuthConfig` + `authHandler`
  wrapping `@auth/core`). Email + password is verified against a Drizzle `users` table
  (bcrypt). The session is a **JWT cookie** (Credentials requires the `jwt` strategy),
  plus a custom `POST /api/auth/register` (Auth.js has no sign-up endpoint).

It runs on the **Bun** runtime. Picking this preset means the dashboard's `products` data
comes from `restRepository` pointed here, and its auth is a thin *remote* Auth.js adapter
pointed here — **no page, query, table, or form in the frontend changes.**

## Zero-config posture

Mirrors the frontend's zero-config `bun dev` (CONTRACT §3):

- **No `DATABASE_URL`** → **SQLite** via `bun:sqlite` (a local `data.db` file, or
  `:memory:`). Tables are created automatically on boot — **no manual migrate step**. A
  dev account (`dev@example.com` / `password`) and a few sample products are seeded on
  first run.
- **`DATABASE_URL` set** → **Postgres** via `drizzle-orm/node-postgres` (the production
  path). Tables are ensured on boot too, so the preset runs without a separate migrate
  step; manage them with drizzle-kit migrations in a real deployment.
- **`AUTH_SECRET`** — a clearly-labelled insecure dev fallback in non-production; in
  production the service **fails closed** (refuses to boot) if it is unset.

## Run

```bash
bun install
bun run dev      # http://localhost:8789  (zero-config SQLite, hot reload)
# or:
bun run start    # no hot reload
```

On Postgres:

```bash
cp .env.example .env   # set DATABASE_URL (+ AUTH_SECRET for prod)
bun run start
```

## Test

```bash
bun install
bun run typecheck
bun test         # asserts CONTRACT §4 against the real app + real Auth.js + in-memory SQLite
```

The suite (`test/contract.test.ts`) exercises the contract end-to-end with no transport
mocks. The auth half drives the **real Auth.js CSRF + cookie flow** exactly as the
frontend's auth-client does: `GET /api/auth/csrf` (capture `csrfToken` + the csrf cookie)
→ `POST /api/auth/register` → `POST /api/auth/callback/credentials` (csrfToken + creds +
cookie, follow the `Set-Cookie` session token) → `GET /api/auth/session` returns the user
with a stable `id`. The data half covers create → list with a correct `X-Total-Count`;
search / filter / sort / pagination; patch → get reflects the change; delete → get → 404;
plus 400/404/409 error paths and the sort-whitelist fallback.

## Environment variables

| Var | Default | Meaning |
| --- | --- | --- |
| `DATABASE_URL` | _(unset)_ | Postgres connection string. Unset → SQLite (zero-config). |
| `SQLITE_PATH` | `./data.db` | SQLite file when `DATABASE_URL` is unset. Use `:memory:` for ephemeral. |
| `AUTH_SECRET` | dev fallback (non-prod only) | Auth.js session-signing secret. **Required in production** (fails closed). |
| `AUTH_URL` | _(unset)_ | The **origin** this service is reached at (read by `@hono/auth-js`). The `/api/auth` base path is fixed in code — don't append it. Optional in dev (derived from the request); set behind a proxy in prod. |
| `DATA_API_TOKEN` | _(unset)_ | Optional bearer token guarding the `/products` data routes. Unset → open (zero-config). Set → every `/products` request needs `Authorization: Bearer <token>`. See **Securing the data API**. |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | Dashboard origin — trusted for CORS. |
| `PORT` | `8789` | HTTP port. |

## Securing the data API

**The `/products` data routes trust their network when `DATA_API_TOKEN` is unset** —
anyone who can reach the port can read and write products. That's deliberate for
zero-config dev (and matches the default wiring, where the frontend calls this service
over a trusted server-to-server hop inside a server fn that already ran `requireUser()`).

**In production, set `DATA_API_TOKEN`** to a long random secret. When it's set, every
`/products` request must carry `Authorization: Bearer <DATA_API_TOKEN>`; a missing or
mismatched token returns `401 { "error": "Unauthorized" }`. The `/api/auth/*` routes are
**not** gated by this — they run their own Auth.js CSRF + cookie flow.

Have the dashboard forward the token from its `restRepository` binding:

```ts
const repo = restRepository<Product, ProductInput, Product>({
  baseUrl: process.env.PRODUCTS_API_URL!,
  path: "/products",
  headers: { Authorization: `Bearer ${process.env.DATA_API_TOKEN!}` },
  map: (raw) => raw,
});
```

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/products` | List. Params `_page` `_limit` `_sort` `_order` `q` `status`; returns a JSON array + `X-Total-Count`. |
| `GET` | `/products/:id` | Read one. `404` when absent. |
| `POST` | `/products` | Create. `201` with the new record; `400` on validation failure. |
| `PATCH` | `/products/:id` | Partial update. `200`; `404` when absent. |
| `DELETE` | `/products/:id` | Delete. `204`; `404` when absent. |
| `GET` | `/api/auth/csrf` | Auth.js — `{ csrfToken }` + a csrf cookie. |
| `POST` | `/api/auth/callback/credentials` | Auth.js sign-in (`csrfToken` + `email` + `password`); sets the session cookie. |
| `GET` | `/api/auth/session` | `{ user: { id, name, email } }` when authed, else `null`. |
| `POST` | `/api/auth/signout` | Auth.js sign-out (`csrfToken`); clears the session cookie. |
| `POST` | `/api/auth/register` | **Custom** sign-up (`{ name, email, password }`). `201`; `409` if the email exists; `400` on bad input. |
| `GET` | `/health` | Liveness. |

Sortable whitelist: `name` `category` `price` `stock` `createdAt` (default `createdAt`
desc). Searchable (`q`, case-insensitive OR): `name` `sku` `category`. Filterable
(exact): `status` ∈ `available` `out_of_stock` `discontinued`.

## Frontend wiring

The dashboard reaches this service through its two seams — **no UI code changes**, only
the two adapter bindings + env vars. Let `SERVICE = http://localhost:8789` (this service's
origin). Because Auth.js uses a CSRF-then-cookie protocol that no SDK on the frontend
speaks for us, the auth side is a **remote Auth.js proxy** (pure `fetch`) + a small custom
`auth-client` that drives the CSRF → callback dance.

### Env vars (in the frontend project)

```bash
# .env in the dashboard repo
PRODUCTS_API_URL=http://localhost:8789   # this service's origin (server-only)
AUTH_SERVER_URL=http://localhost:8789    # same origin; Auth.js lives at /api/auth/*
```

This service also needs `FRONTEND_ORIGIN=http://localhost:3000` so its CORS admits the
dashboard.

### Data — bind `products` to `restRepository`

In the frontend's `src/features/products/server.ts`, replace the `drizzleRepository`
binding with `restRepository` pointed at this service. The **defaults already match** this
service's json-server dialect (`_page`/`_limit`/`_sort`/`_order`/`q` + `x-total-count`),
so no `params`/`totalHeader` override is needed — only the status filter passes through as
the `status` query param, which `restRepository` already forwards from `params.filters`:

```ts
import { restRepository } from "@/infra/data/rest-repository";
import type { Product } from "./schema";

const repo = restRepository<Product, ProductInput, Product>({
  baseUrl: process.env.PRODUCTS_API_URL!, // http://localhost:8789
  path: "/products",
  map: (raw) => raw,        // wire shape already equals Product
  // serialize defaults to identity; ProductInput maps 1:1 to the request body.
});
```

The `list*/get*/create*/update*/delete*` server fns keep calling `repo.*` exactly as they
do for Drizzle. Because the fetch runs inside a server fn that has already called
`requireUser()`, no auth header is sent on data calls (CONTRACT §1).

### Auth — remote Auth.js `AuthProvider` + custom `auth-client` (CONTRACT §2c)

Auth.js has its own CSRF + cookie protocol, so the frontend wiring is a **pure-fetch
remote proxy** (no Auth.js SDK on the frontend). Two pieces:

**1. `AuthProvider` — `src/lib/auth-providers/remote-authjs.ts`**

- `getSession(headers)` = `GET {AUTH_SERVER_URL}/api/auth/session` forwarding the request
  cookies; normalize `{ user }`. Auth.js returns `{ user: { id, name, email } }` on a JWT
  session because this service's `jwt`/`session` callbacks put a stable `id` on the token —
  if a deployment ever omits `id`, synthesize a stable one from the email.
- `handler(request)` = proxy `/api/auth/*` to `{AUTH_SERVER_URL}/api/auth/*`, forwarding
  method / headers / body and **rewriting upstream `Set-Cookie` to host-only** (drop the
  `Domain` attribute) so both the `authjs.csrf-token` and `authjs.session-token` cookies
  land on the dashboard origin.

Point the seam at it:

```ts
// src/lib/auth-provider.ts
import { remoteAuthjsProvider } from "@/lib/auth-providers/remote-authjs";
export const authProvider: AuthProvider = remoteAuthjsProvider;
```

**2. `auth-client` — the CSRF → callback dance (`src/lib/auth-client.ts`)**

All calls hit the dashboard's own same-origin `/api/auth/*`, which the proxy above
forwards to the service:

- `signIn.email({ email, password })`:
  1. `GET /api/auth/csrf` → read `{ csrfToken }` (the proxy lands the csrf cookie on the
     dashboard origin).
  2. `POST /api/auth/callback/credentials` with
     `Content-Type: application/x-www-form-urlencoded`, body
     `csrfToken=<t>&email=<e>&password=<p>` (the proxy lands the session cookie). A `302`
     to `/` (or a `200`) with a `Set-Cookie` is success; a `302` whose location carries
     `?error=` is a failed credential check.
- `signUp.email({ name, email, password })`:
  `POST /api/auth/register` (JSON), then run the `signIn.email` dance.
- `signOut()`: `GET /api/auth/csrf` then `POST /api/auth/signout` with the `csrfToken`.
- `useSession()` = the `getSession` server fn.

`_app.tsx` / `requireUser()` are unchanged — they read the normalized session from
`getSession`. (Note: this is **not** the better-auth client; Auth.js speaks a different
form-encoded CSRF protocol, hence the custom client.)
