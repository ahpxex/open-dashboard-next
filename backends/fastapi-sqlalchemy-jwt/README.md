# Preset: FastAPI + SQLAlchemy + JWT

A **standalone, runnable Python service** that backs the open-dashboard frontend through
its two seams — **`Repository`** (data) and **`AuthProvider`** (auth) — without changing
any page, query, table, or form. It speaks the shared wire contract in
[`../CONTRACT.md`](../CONTRACT.md): json-server-dialect REST for the `products` resource
(§1) and a custom HS256-JWT auth surface (§2a).

- **Framework**: FastAPI (ASGI, Uvicorn).
- **Data**: SQLAlchemy 2.0 (typed `DeclarativeBase` / `Mapped`), Pydantic v2 validation.
- **Auth**: custom JWT — PyJWT (HS256) + passlib/bcrypt password hashing.
- **DB**: SQLite by default (zero-config, file `./app.db`, tables auto-created on
  startup); Postgres when `DATABASE_URL` is set (`psycopg`).

## Layout

```
fastapi-sqlalchemy-jwt/
├── pyproject.toml          # PEP 621, pinned deps, [postgres] + [dev] extras
├── .env.example
├── app/
│   ├── config.py           # settings; zero-config + fail-closed-in-prod secret
│   ├── db.py               # engine, session, Base, init_db()
│   ├── models.py           # Product + User ORM models (typed)
│   ├── schemas.py          # Pydantic v2 request/response shapes
│   ├── auth.py             # hashing, JWT encode/decode, current_user dependency
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

Move onto Postgres by exporting `DATABASE_URL` (and a real secret):

```bash
export DATABASE_URL="postgresql+psycopg://user:pass@localhost:5432/dashboard"
export AUTH_JWT_SECRET="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"
uv run uvicorn app.main:app --port 8000
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
plus validation, 401/404 paths, and that passwords are hashed.

## Environment variables

| Var | Default | Meaning |
| --- | --- | --- |
| `APP_ENV` | `development` | `production` makes `AUTH_JWT_SECRET` mandatory (fail-closed boot). |
| `DATABASE_URL` | _unset_ → SQLite `./app.db` | Set to a `postgresql+psycopg://…` URL for Postgres. |
| `AUTH_JWT_SECRET` | insecure dev fallback | HS256 signing secret. **Required in production.** |
| `AUTH_JWT_TTL_SECONDS` | `604800` (7 days) | JWT lifetime. |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins (or `*`). |

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
forwarded on data calls (CONTRACT §1). The list endpoint exposes `X-Total-Count` via CORS
for completeness.

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
