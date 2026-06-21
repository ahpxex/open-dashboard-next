# Preset: Hono + Drizzle + better-auth (standalone TS service)

A **standalone, runnable backend service** for the open-dashboard frontend. It speaks the
shared wire contract in [`../CONTRACT.md`](../CONTRACT.md):

- **Data** — the `products` resource as a **json-server-dialect REST API**
  (`_page`/`_limit`/`_sort`/`_order`/`q`/`status` + an `X-Total-Count` header),
  backed by Drizzle.
- **Auth** — **real better-auth** (email + password, Drizzle adapter) hosted at
  `/api/auth/*` (CONTRACT §2b) — the same SDK the in-process default uses, just on a
  separate origin.

It runs on the **Bun** runtime. Picking this preset means the dashboard's `products`
data comes from `restRepository` pointed here, and its auth is a thin *remote* better-auth
adapter pointed here — **no page, query, table, or form in the frontend changes.**

## Zero-config posture

Mirrors the frontend's zero-config `bun dev` (CONTRACT §3):

- **No `DATABASE_URL`** → **SQLite** via `bun:sqlite` (a local `data.db` file, or
  `:memory:`). Tables are created automatically on boot — **no manual migrate step**. A
  dev account (`dev@example.com` / `password`) and a few sample products are seeded on
  first run.
- **`DATABASE_URL` set** → **Postgres** via `drizzle-orm/node-postgres` (the production
  path). Tables are ensured on boot too, so the preset runs without a separate migrate
  step; manage them with drizzle-kit migrations in a real deployment.
- **`BETTER_AUTH_SECRET`** — a clearly-labelled insecure dev fallback in non-production;
  in production the service **fails closed** (refuses to boot) if it is unset.

## Run

```bash
bun install
bun run dev      # http://localhost:8787  (zero-config SQLite, hot reload)
# or:
bun run start    # no hot reload
```

On Postgres:

```bash
cp .env.example .env   # set DATABASE_URL (+ BETTER_AUTH_SECRET for prod)
bun run start
```

## Test

```bash
bun install
bun run typecheck
bun test         # asserts CONTRACT §4 against the real app + in-memory SQLite
```

The suite (`test/contract.test.ts`) exercises the contract end-to-end with no transport
mocks: register → sign-in → get-session round-trip; create → list with a correct
`X-Total-Count`; search / filter / sort / pagination; patch → get reflects the change;
delete → get → 404; plus 400/404 error paths and the sort-whitelist fallback.

## Environment variables

| Var | Default | Meaning |
| --- | --- | --- |
| `DATABASE_URL` | _(unset)_ | Postgres connection string. Unset → SQLite (zero-config). |
| `SQLITE_PATH` | `./data.db` | SQLite file when `DATABASE_URL` is unset. Use `:memory:` for ephemeral. |
| `BETTER_AUTH_SECRET` | dev fallback (non-prod only) | Session-signing secret. **Required in production** (fails closed). |
| `BETTER_AUTH_URL` | _(unset)_ | The origin this service is reached at (better-auth `baseURL`). Set in prod. |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | Dashboard origin — trusted for CORS + better-auth CSRF (`trustedOrigins`). |
| `PORT` | `8787` | HTTP port. |

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/products` | List. Params `_page` `_limit` `_sort` `_order` `q` `status`; returns a JSON array + `X-Total-Count`. |
| `GET` | `/products/:id` | Read one. `404` when absent. |
| `POST` | `/products` | Create. `201` with the new record; `400` on validation failure. |
| `PATCH` | `/products/:id` | Partial update. `200`; `404` when absent. |
| `DELETE` | `/products/:id` | Delete. `204`; `404` when absent. |
| `*` | `/api/auth/*` | better-auth (`/sign-up/email`, `/sign-in/email`, `/sign-out`, `/get-session`). |
| `GET` | `/health` | Liveness. |

Sortable whitelist: `name` `category` `price` `stock` `createdAt` (default `createdAt`
desc). Searchable (`q`, case-insensitive OR): `name` `sku` `category`. Filterable
(exact): `status` ∈ `available` `out_of_stock` `discontinued`.

## Frontend wiring

The dashboard reaches this service through its two seams — **no UI code changes**, only
the two adapter bindings + env vars. Let `SERVICE = http://localhost:8787` (this
service's origin).

### Env vars (in the frontend project)

```bash
# .env in the dashboard repo
PRODUCTS_API_URL=http://localhost:8787   # this service's origin (server-only)
AUTH_SERVER_URL=http://localhost:8787    # same origin; better-auth lives at /api/auth/*
```

This service also needs `FRONTEND_ORIGIN=http://localhost:3000` so its CORS +
`trustedOrigins` admit the dashboard.

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
  baseUrl: process.env.PRODUCTS_API_URL!, // http://localhost:8787
  path: "/products",
  map: (raw) => raw,        // wire shape already equals Product
  // serialize defaults to identity; ProductInput maps 1:1 to the request body.
});
```

The `list*/get*/create*/update*/delete*` server fns keep calling `repo.*` exactly as they
do for Drizzle. Because the fetch runs inside a server fn that has already called
`requireUser()`, no auth header is sent on data calls (CONTRACT §1).

### Auth — activate the shipped remote better-auth `AuthProvider` (CONTRACT §2b)

This service hosts the *same* better-auth protocol as the in-process default, so the
frontend wiring is a thin **remote** adapter that already ships — typechecked — in the
scaffold base (`src/lib/auth-providers/remote-better-auth.ts`). You only activate it:

1. Point the auth seam at the shipped provider:

   ```ts
   // src/lib/auth-provider.ts
   import { remoteBetterAuthProvider } from "@/lib/auth-providers/remote-better-auth";
   export const authProvider: AuthProvider = remoteBetterAuthProvider;
   ```

2. Set `AUTH_SERVER_URL=http://localhost:8787` (this service's origin).

3. **Keep `src/lib/auth-client.ts` as-is** (proxy mode): the browser hits the dashboard's
   own same-origin `/api/auth/*`, and `remoteBetterAuthProvider.handler` proxies to the
   service, forwarding method/headers/body and rewriting upstream `Set-Cookie` to
   host-only (drops `Domain`) so the session cookie lands on the dashboard origin.
   `getSession` → the remote `/api/auth/get-session`. `_app.tsx`/`requireUser()` unchanged.

   (Direct cross-origin mode is optional: point the better-auth client's `baseURL` at the
   service via `VITE_BETTER_AUTH_URL` and skip the proxy — needs CORS + cross-site cookies.)

The service's `trustedOrigins` (from `FRONTEND_ORIGIN`) must include the dashboard origin
so CSRF + CORS admit these calls.
