# Backend contract

Every backend preset under `backends/` is a **standalone, runnable service** that the
dashboard frontend (this repo) reaches through its two seams — **`Repository`** (data)
and **`AuthProvider`** (auth) — without changing any page, query, table, or form.

To make a single frontend wiring serve multiple stacks, the **HTTP-API presets**
(`hono-drizzle-betterauth`, `fastapi-sqlalchemy-jwt`) all speak the **same wire
contract** defined here. The **`supabase`** preset is the exception: it is consumed
through Supabase's own PostgREST + Auth surface and ships its own thin adapter — see
`backends/supabase/README.md`.

This file is the single source of truth for that contract. A preset that diverges from
it will not wire up cleanly, and its verification (`backends/<preset>` test project)
asserts against these exact shapes.

---

## 0. The sample resource: `products`

Every preset ships one canonical resource, `products`, mirroring the frontend's
`src/features/products` exactly so the wiring maps one-to-one. A product record:

| Field         | Type                                                   | Notes                                  |
| ------------- | ------------------------------------------------------ | -------------------------------------- |
| `id`          | string (UUID)                                          | server-assigned, stable                |
| `name`        | string, non-empty                                      | searchable                             |
| `sku`         | string, non-empty                                      | searchable                             |
| `category`    | string, non-empty                                      | searchable, sortable                   |
| `price`       | number ≥ 0                                             | sortable                               |
| `stock`       | integer ≥ 0                                            | sortable                               |
| `status`      | enum: `available` \| `out_of_stock` \| `discontinued`  | filterable (exact match)               |
| `description` | string (may be empty)                                  |                                        |
| `createdAt`   | string (ISO-8601, UTC)                                 | sortable, default sort key (desc)      |
| `updatedAt`   | string (ISO-8601, UTC)                                 | bumped on every write                  |

**`ProductInput`** (create / update body) = all of the above **except** the four
server-owned fields (`id`, `createdAt`, `updatedAt`). `description` is optional and
defaults to `""`. The server validates input and rejects unknown/invalid fields.

**Whitelists** (mirror the frontend; never sort or filter by raw input):

- Searchable (`q` matches case-insensitively, OR across): `name`, `sku`, `category`.
- Sortable (`_sort`): `name`, `category`, `price`, `stock`, `createdAt`. Anything else
  → fall back to the default sort.
- Filterable (exact match): `status`.
- Default sort: `createdAt` descending.

---

## 1. Data API — json-server dialect (`Repository` via `restRepository`)

The frontend binds [`restRepository`](../src/infra/data/rest-repository.ts) with its
**default** query-param names, so backends MUST speak the json-server dialect verbatim.
Base path is the collection, e.g. `/products`.

### `GET /products` — list

Query params (all optional except none are required):

| Param      | Meaning                       | Example         |
| ---------- | ----------------------------- | --------------- |
| `_page`    | 1-based page number           | `_page=2`       |
| `_limit`   | page size                     | `_limit=10`     |
| `_sort`    | sort field (from whitelist)   | `_sort=price`   |
| `_order`   | `asc` \| `desc`               | `_order=desc`   |
| `q`        | full-text search              | `q=widget`      |
| `status`   | exact-match filter            | `status=available` |

- **Body**: `200` with a **JSON array** of the matching page of product objects.
- **Header**: `X-Total-Count: <n>` — the count of the **filtered, not paginated** set.
  `restRepository` reads this to drive pagination. It MUST be present.
- Unknown sort fields fall back to the default sort; unknown filter keys are ignored.
- CORS (only needed if a browser hits the backend directly — the frontend proxies
  server-side, so this is belt-and-suspenders): expose the count header with
  `Access-Control-Expose-Headers: X-Total-Count`.

### `GET /products/:id` — read one

`200` product object, or `404` if absent (the frontend maps `404 → null`).

### `POST /products` — create

Body = `ProductInput`. `201` (or `200`) with the created product (including `id`).
`400` on validation failure.

### `PATCH /products/:id` — update

Body = partial `ProductInput`. `200` with the full updated product. `404` if absent.

### `DELETE /products/:id` — delete

`200` or `204`. `404` if absent.

> The frontend never sends auth on these data calls in the default wiring (the fetch
> runs inside a server fn that has already called `requireUser()`); the API is reached
> over a trusted server-to-server hop. All HTTP-API presets support an **optional**
> bearer guard on data routes via the standard `DATA_API_TOKEN` env var: when set, the
> frontend forwards it through `restRepository`'s `headers`
> (`{ Authorization: 'Bearer <DATA_API_TOKEN>' }`) and the backend rejects requests
> without it; when unset, the data routes are open and **MUST NOT** be publicly exposed
> (keep them on the trusted server-to-server hop).

> **Per-preset exception (validation status):** the `fastapi-sqlalchemy-jwt` preset
> returns `422` (not `400`) on validation failure — this is FastAPI/Pydantic's native
> behaviour and an accepted exception to the documented `400`.

---

## 2. Auth API

Every preset normalizes to the frontend's `AuthSession` (`{ user: { id, email, name } }`)
behind an `AuthProvider`. There are **three supported auth shapes**; a preset implements
exactly one, and ships the matching frontend wiring (`AuthProvider` + `auth-client`).

| Shape | Preset(s) | Frontend wiring |
| --- | --- | --- |
| **2a. Custom JWT** (`/auth/*`, bearer) | `fastapi-sqlalchemy-jwt` | external-JWT `AuthProvider` + custom `auth-client` |
| **2b. Remote better-auth** (`/api/auth/*`, cookies) | `hono-drizzle-betterauth`, `hono-prisma-betterauth` | remote-better-auth `AuthProvider` + better-auth client |
| **2c. Remote Auth.js** (`/api/auth/*`, CSRF + cookies) | `hono-drizzle-authjs` | remote-authjs `AuthProvider` + custom `auth-client` |

> Why three shapes: Python has no better-auth, so the FastAPI preset rolls a small,
> explicit JWT auth (2a). The better-auth presets host **real better-auth** (2b) — same
> SDK the in-process default uses. The Auth.js preset hosts **Auth.js (NextAuth) v5** (2c)
> with a Credentials provider — a different cookie/CSRF protocol, wired by its own remote
> proxy. All three resolve to the same normalized session.

### 2a. Custom JWT (`fastapi-sqlalchemy-jwt`)

Stateless HS256 JWTs; secret `AUTH_JWT_SECRET`. Claims: `sub` = user id, `email`,
`name`, `iat`, `exp` (default 7 days).

- `POST /auth/register` — body `{ email, password, name }` → `201 { token, user }`.
  `409` if email exists, `400` on validation.
- `POST /auth/login` — body `{ email, password }` → `200 { token, user }`. `401` on bad
  credentials. Passwords stored hashed (bcrypt/argon2 — never plaintext).
- `GET /auth/me` — header `Authorization: Bearer <token>` → `200 { id, email, name }`,
  else `401`. This is what `getSession` calls on every guarded load.
- `POST /auth/logout` — `200 { ok: true }` (stateless; the frontend clears its cookie).

**Cookie handoff**: the browser only talks to the **frontend** origin (`/api/auth/*`).
The frontend's `AuthProvider.handler` forwards to `{AUTH_API_URL}/auth/*`, reads
`{ token, user }`, and sets the session cookie **on the frontend origin**:

```
Set-Cookie: session=<token>; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800
```

So this backend returns the token in the **JSON body**, not as a cookie — the frontend
owns the cookie. `getSession` reads `session=<token>` and validates it via `GET /auth/me`.

### 2b. Remote better-auth (`hono-drizzle-betterauth`)

The service hosts better-auth (email + password, Drizzle adapter) at `/api/auth/*` — the
exact same protocol as the in-process default, just on a standalone origin. Endpoints
are better-auth's own (`/api/auth/sign-in/email`, `/sign-up/email`, `/sign-out`,
`/get-session`), cookie-based.

The frontend wiring is a thin **remote** adapter, not a re-implementation:

- `auth-client` = `createAuthClient({ baseURL: <service-origin> })` — same
  `signIn`/`signUp`/`signOut`/`useSession` surface, calls land on the service.
- `AuthProvider.getSession` = `GET {service}/api/auth/get-session` forwarding the request
  cookies; normalize the result to `{ user }`.
- `AuthProvider.handler` = proxy `/api/auth/*` to `{service}/api/auth/*`, forwarding
  method/headers/body and **rewriting upstream `Set-Cookie` to host-only** (drop the
  `Domain` attribute) so the session cookie lands on the frontend origin.

The service must set `trustedOrigins` to include the frontend origin (CORS + CSRF), and
its better-auth `baseURL`/secret follow the same fail-closed-in-prod rule as §3.

> `hono-prisma-betterauth` implements this exact shape too — only the service's ORM
> differs (Prisma instead of Drizzle), so it reuses the **same** frontend wiring.

### 2c. Remote Auth.js / NextAuth (`hono-drizzle-authjs`)

The service hosts **Auth.js (NextAuth) v5** with a **Credentials** provider (JWT session
strategy — Credentials requires it) at `/api/auth/*`, plus a custom `POST /api/auth/register`
(Auth.js has no sign-up endpoint). Endpoints are Auth.js's own conventions:

- `GET /api/auth/csrf` → `{ csrfToken }`.
- `POST /api/auth/callback/credentials` (body: `csrfToken`, `email`, `password`) → sets the
  Auth.js session cookie. This is the sign-in.
- `GET /api/auth/session` → `{ user: { id?, name, email } }` when authed, else `{}`.
- `POST /api/auth/signout` (with `csrfToken`) → clears the session cookie.
- `POST /api/auth/register` (custom; body `{ name, email, password }`) → creates the user
  (bcrypt-hashed) so the next sign-in succeeds. `409` if the email exists.

The frontend wiring is a **remote Auth.js proxy** (pure `fetch`, no Auth.js SDK on the
frontend) + a small `auth-client` that drives the CSRF→callback dance:

- `auth-client.signIn.email` = `GET /api/auth/csrf` then `POST /api/auth/callback/credentials`.
  `signUp.email` = `POST /api/auth/register` then sign-in. `signOut` = csrf + `signout`.
  `useSession` = the `getSession` server fn.
- `AuthProvider.getSession` = `GET {service}/api/auth/session` forwarding cookies; normalize
  `{ user }` (synthesize a stable `id` from the email if Auth.js omits it on a JWT session).
- `AuthProvider.handler` = proxy `/api/auth/*` to the service, rewriting `Set-Cookie` to
  host-only.

`AUTH_SECRET` (Auth.js) follows the same fail-closed-in-prod rule; the service sets
`trustedOrigins`/`trustHost` for the frontend origin.

---

## 3. Zero-config posture (mirror the frontend)

Each HTTP-API preset MUST boot with **no external infrastructure**, exactly like the
frontend's zero-config `bun dev`:

- **No `DATABASE_URL`** → SQLite file (or in-memory) so the service runs on a clean
  checkout with one install + one run command. The bundled test project relies on this.
- **`DATABASE_URL` set** → Postgres (the production path).
- **No `AUTH_JWT_SECRET`** in dev → a clearly-labelled insecure dev fallback; in
  production the service MUST fail closed (refuse to boot) if the secret is unset, the
  same way `src/lib/auth.ts` does.

---

## 4. Verification obligation

Every preset directory ships its own test suite that asserts this contract against the
real service (no mocks of its own transport):

1. `register` → `login` → `GET /auth/me` round-trips a user.
2. `POST /products` then `GET /products?_page=1&_limit=10` returns the row and a correct
   `X-Total-Count`.
3. Search (`q`), filter (`status`), sort (`_sort`/`_order`), and pagination each work.
4. `PATCH` then `GET /products/:id` reflects the change; `DELETE` then `GET` → 404.

The repo-level verification (the `backends/<preset>` "test project" runs) stands each
service up for real and exercises this list end-to-end. See each preset's README.
