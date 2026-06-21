# Preset: FastAPI + SQLAlchemy + JWT

A **standalone, runnable Python service** that backs the open-dashboard frontend through
its two seams — **`Repository`** (data) and **`AuthProvider`** (auth) — without changing
any page, query, table, or form. It speaks the shared wire contract in
[`../CONTRACT.md`](../CONTRACT.md): json-server-dialect REST for the `products` resource
(§1) and a custom HS256-JWT auth surface (§2a).

- **Framework**: FastAPI (ASGI, Uvicorn).
- **Data**: SQLAlchemy 2.0 (typed `DeclarativeBase` / `Mapped`), Pydantic v2 validation.
- **Auth**: custom JWT — PyJWT (HS256) + **Argon2id** password hashing via the
  maintained [`pwdlib`](https://github.com/frankie567/pwdlib).
- **DB**: SQLite by default (zero-config, file `./app.db`, tables auto-created on
  startup); Postgres when `DATABASE_URL` is set (`psycopg`), with **Alembic**
  migrations for the production schema.

## Layout

```
fastapi-sqlalchemy-jwt/
├── pyproject.toml          # PEP 621, pinned deps, [postgres] + [dev] extras
├── .env.example
├── alembic.ini             # Alembic config (DB URL comes from app settings)
├── migrations/             # Alembic env + versions/0001_initial.py
├── app/
│   ├── config.py           # settings; zero-config + fail-closed-in-prod secret + DATA_API_TOKEN
│   ├── db.py               # engine, session, Base, init_db()
│   ├── models.py           # Product + User ORM models (typed, indexed)
│   ├── schemas.py          # Pydantic v2 request/response shapes
│   ├── auth.py             # Argon2 hashing, JWT encode/decode, current_user + data-token guards
│   ├── main.py             # app factory, CORS, table-create on startup, routers
│   └── routers/
│       ├── auth.py         # /auth/register · /login · /me · /logout
│       └── products.py     # /products json-server dialect + X-Total-Count
└── tests/                  # pytest: full CONTRACT §4 suite via httpx/TestClient
```

## Run

Uses [uv](https://docs.astral.sh/uv/). Create the venv with a stable Python:

```bash
uv venv --python 3.12
uv pip install -e ".[dev]"          # add ".[postgres]" for the Postgres driver

# Zero-config: SQLite + insecure dev JWT secret, tables auto-created.
uv run uvicorn app.main:app --reload --port 8000
# → http://localhost:8000  (OpenAPI docs at /docs)
```

Move onto Postgres by exporting `DATABASE_URL` (and a real secret), then run the
migrations before starting the server:

```bash
export DATABASE_URL="postgresql+psycopg://user:pass@localhost:5432/dashboard"
export AUTH_JWT_SECRET="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"
uv run alembic upgrade head          # create the schema (see "Migrations" below)
uv run uvicorn app.main:app --port 8000
```

## Migrations

The schema is managed with **Alembic**. Two paths, by design:

- **Zero-config SQLite dev** — `init_db()` runs `create_all` on startup, so the
  local `./app.db` is ready with no migration step. This keeps `bun dev`-style
  one-command boot.
- **Postgres production** — run `uv run alembic upgrade head` to apply the
  versioned migrations (`migrations/versions/`). The initial revision
  (`0001_initial`) creates the `users` + `products` tables and the indexes that
  back the list-query whitelists. Do **not** rely on `create_all` here.

Alembic reads the database URL from the **same** app settings the service uses
(`migrations/env.py` → `get_settings().sqlalchemy_url`), so `alembic` and the app
always target the same database. After changing a model, autogenerate the next
revision:

```bash
uv run alembic revision --autogenerate -m "describe the change"
uv run alembic upgrade head
```

## Test

```bash
uv pip install -e ".[dev]"
uv run pytest -q
```

The suite stands the real app up (httpx `TestClient`, no transport mocks) against an
isolated in-memory SQLite DB and asserts the full contract (CONTRACT §4): register →
login → `GET /auth/me`; create then list with a correct `X-Total-Count`; search /
filter / sort / pagination; patch then get reflects the change; delete then get → 404;
plus validation, 401/404 paths, and that passwords are hashed. It also covers the
optional **data-API bearer guard** (`tests/test_data_token.py`): with `DATA_API_TOKEN`
set, a data request without the bearer is 401 and with the correct bearer succeeds,
while auth routes stay ungated. (The rest of the suite runs with the token UNSET, which
is the zero-config dev posture.)

> **Validation status code**: this preset keeps FastAPI/Pydantic's **native `422`**
> for request-validation failures (bad/missing fields). The shared CONTRACT writes
> `400` generically for "validation failure"; the FastAPI preset standardizes on
> `422` and the orchestrator notes this exception centrally.

## Environment variables

| Var | Default | Meaning |
| --- | --- | --- |
| `APP_ENV` | `development` | `production` makes `AUTH_JWT_SECRET` mandatory (fail-closed boot). |
| `DATABASE_URL` | _unset_ → SQLite `./app.db` | Set to a `postgresql+psycopg://…` URL for Postgres. |
| `AUTH_JWT_SECRET` | insecure dev fallback | HS256 signing secret. **Required in production.** |
| `AUTH_JWT_TTL_SECONDS` | `604800` (7 days) | JWT lifetime. |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins (or `*`). |
| `DATA_API_TOKEN` | _unset_ → data API open | Optional bearer guard on `/products` (see below). |

## Securing the data API

**The `/products` data routes trust their network when `DATA_API_TOKEN` is unset** —
anyone who can reach this port can read and write product data. CONTRACT §1 allows this
because the default wiring reaches the API over a trusted server-to-server hop (the
frontend's server fn has already called `requireUser()`), so no token is forwarded.
That is fine for local dev and a private network, but **in production set
`DATA_API_TOKEN`** to a strong random value and have the dashboard forward it:

```ts
// src/features/products/server.ts
const repo = restRepository<Product, ProductInput>({
  baseUrl: process.env.PRODUCTS_API_URL!,
  path: "/products",
  headers: { Authorization: `Bearer ${process.env.DATA_API_TOKEN!}` },
  map: (raw) => raw as Product,
});
```

When `DATA_API_TOKEN` is set, every `/products` request (collection **and** item
routes) must carry `Authorization: Bearer <DATA_API_TOKEN>`; a missing or mismatched
token is rejected with `401 {"detail": "Unauthorized"}`. The auth routes (`/auth/*`)
are **never** gated by this — they have their own auth. Generate a token with
`python -c "import secrets; print(secrets.token_urlsafe(48))"`.

## Frontend wiring

This preset uses the shared HTTP-API wiring: **`restRepository`** for data and the
**external-JWT `AuthProvider`** for auth. Nothing in the frontend's pages/queries/tables
changes — only the two seam bindings + two env vars. (Documentation only; do **not** edit
the frontend as part of building this preset.)

Let `PRODUCTS_API_URL` be this service's origin (e.g. `http://localhost:8000`) and
`AUTH_API_URL` the same origin.

### Data — bind `restRepository` in `src/features/products/server.ts`

The service speaks the json-server dialect with the **default** param names
(`_page` / `_limit` / `_sort` / `_order` / `q`) and returns `X-Total-Count`, so the
repository needs no param overrides:

```ts
import { restRepository } from "@/infra/data/rest-repository";
import type { Product, ProductInput } from "./schema";

const repo = restRepository<Product, ProductInput>({
  baseUrl: process.env.PRODUCTS_API_URL!, // e.g. http://localhost:8000
  path: "/products",
  map: (raw) => raw as Product,            // wire shape already matches Product
  // defaults: params = json-server, totalHeader = "x-total-count"
});
```

The fetch runs inside a server fn that has already called `requireUser()`, so no token is
forwarded on data calls by default (CONTRACT §1). The list endpoint exposes `X-Total-Count`
via CORS for completeness. **In production, set `DATA_API_TOKEN` on the service and add a
`headers: { Authorization: 'Bearer <token>' }`** to the repository above — see
[Securing the data API](#securing-the-data-api).

### Auth — activate the shipped external-JWT `AuthProvider` (CONTRACT §2a)

The complete provider **already ships, typechecked and unit-tested**, in the scaffold
base — you only activate it. The browser only ever talks to the **frontend** origin
(`/api/auth/*`); the provider forwards to `{AUTH_API_URL}/auth/*`, reads `{ token, user }`,
and sets the session cookie **on the frontend origin** (the backend returns the token in
the JSON body, never as a cookie).

1. Point the auth seam at the shipped provider:

   ```ts
   // src/lib/auth-provider.ts
   import { externalJwtAuthProvider } from "@/lib/auth-providers/external-jwt";
   export const authProvider: AuthProvider = externalJwtAuthProvider;
   ```

2. Swap the browser client to the matching one (mirrors the better-auth surface the pages
   use, so no page changes):

   ```ts
   // src/lib/auth-client.ts
   export * from "@/lib/auth-clients/external-jwt";
   ```

3. Set `AUTH_API_URL=http://localhost:8000` (this service's origin).

`getSession` reads `session=<jwt>` from the request cookie and validates it via
`GET {AUTH_API_URL}/auth/me`; `handler` proxies `/api/auth/{login,register,logout}` and
lifts the `token` into a host-only `session` cookie. `_app.tsx`/`requireUser()` unchanged.
(Implementation: `src/lib/auth-providers/external-jwt.ts`.)

### Env vars the frontend needs

| Var | Example | Used by |
| --- | --- | --- |
| `PRODUCTS_API_URL` | `http://localhost:8000` | `restRepository.baseUrl` in `products/server.ts`. |
| `AUTH_API_URL` | `http://localhost:8000` | external-JWT `AuthProvider` (`/auth/me`, `/auth/login`, …). |

Both default to this service's origin; point them at wherever you deploy it.
