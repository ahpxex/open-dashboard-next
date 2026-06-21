# Preset: Supabase (hosted Postgres + PostgREST + Supabase Auth)

A **BaaS** backend for the dashboard: data lives in Supabase Postgres, reached over
its **PostgREST** REST surface; auth is **Supabase Auth** (email + password). Unlike
the `hono` / `fastapi` HTTP-API presets, Supabase does **not** speak the json-server
wire dialect (`_page`/`_limit` + `X-Total-Count`) — it speaks PostgREST (`Range`
header + `Content-Range`). So this preset ships its **own thin frontend adapter** (a
`supabaseRepository` + a Supabase `AuthProvider`) instead of reusing the shared
`restRepository` wiring. This directory is the **SQL + config + docs**; there is no
long-running service to run.

## What's here

| File | Purpose |
| --- | --- |
| `supabase/migrations/20260101000000_init.sql` | Creates `public.products` (CONTRACT §0 fields, snake_case), the `updated_at` trigger, and **RLS enabled + forced** with `authenticated`-only CRUD policies (anon denied). |
| `supabase/seed.sql` | A dozen demo products (mirrors the frontend's `demo-data.ts`), idempotent. |
| `supabase/config.toml` | Minimal valid Supabase project config (API/db/auth ports, email+password, local seed). |
| `.env.example` | Server vars (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) + the browser vars the auth-client needs (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). |

## Run it for real

### Local (Supabase CLI + Docker)

```bash
# from this directory (backends/supabase)
supabase init          # only if no supabase/ project is linked yet (this repo already ships one)
supabase start         # boots Postgres + PostgREST + Auth + Studio in Docker;
                       # prints API URL + anon/service-role keys
supabase db reset      # applies migrations/*.sql then seed.sql into a clean db
```

`supabase start` prints the `API URL` (default `http://127.0.0.1:54321`) and the
`anon key` / `service_role key`. Copy them into the frontend's env (see below).
`supabase db reset` re-runs every migration + the seed, so it's the idempotent way to
get a known-good schema.

### Hosted project (no Docker)

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push       # applies migrations/*.sql to the hosted database
# seed the hosted db once (optional):
psql "$(supabase db remote-url)" -f supabase/seed.sql
```

Grab `SUPABASE_URL` + the anon / service-role keys from **Project Settings → API**.

## Env vars

There are two sides, each needing its own URL + anon-key pair. The **server** side
(server fns, the `AuthProvider`, the data adapter) reads the plain `SUPABASE_*` vars;
the **browser** side (the supabase-js browser client in `auth-client.ts`) reads the
`VITE_SUPABASE_*` vars — Vite only exposes `import.meta.env.VITE_*` to client code, so
the browser client **requires** the VITE pair or it constructs with `undefined` and
sign-in breaks. Both pairs point at the same project; keep their values in sync. The
service-role key is server-only and has **no** VITE counterpart.

| Var | Where used | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | server (data + auth) | Project API URL. Local: `http://127.0.0.1:54321`. Hosted: `https://<ref>.supabase.co`. |
| `SUPABASE_ANON_KEY` | server (data + auth) | Public key. The **default data path** builds an anon client carrying the user's JWT so RLS applies. |
| `SUPABASE_SERVICE_ROLE_KEY` | server (**admin only**) | Bypasses RLS. Never expose to the browser. Reserved for explicit admin ops, **not** the per-user data path. Optional. |
| `VITE_SUPABASE_URL` | browser (auth-client) | Same value as `SUPABASE_URL`. Required by the browser client. |
| `VITE_SUPABASE_ANON_KEY` | browser (auth-client) | Same value as `SUPABASE_ANON_KEY`. Required by the browser client. Safe to ship; RLS gates it. |

## Column mapping (snake_case ↔ camelCase)

Postgres/PostgREST columns are snake_case; the dashboard's `Product` type is camelCase.
The frontend adapter's `map` / `serialize` does the translation:

| DB column (snake_case) | Frontend field (camelCase) |
| --- | --- |
| `id` | `id` |
| `name` | `name` |
| `sku` | `sku` |
| `category` | `category` |
| `price` (`numeric`) | `price` (number — coerce, PostgREST returns numerics as strings) |
| `stock` (`integer`) | `stock` |
| `status` | `status` |
| `description` | `description` |
| `created_at` (`timestamptz`) | `createdAt` (ISO-8601 string) |
| `updated_at` (`timestamptz`) | `updatedAt` (ISO-8601 string) |

`price` MUST be coerced to a JS number on read — PostgREST serialises `numeric` as a
JSON **string** to avoid float loss.

## Frontend wiring (built separately — this is the contract it depends on)

The frontend wiring lives in the dashboard repo, not here. Building it means swapping
two seams. The exact shapes it must implement, so SQL and wiring stay consistent:

### Data — `supabaseRepository` (the `Repository` binding)

A `Repository<Product, ProductInput>` implemented with `@supabase/supabase-js`
(server-side, inside the resource's `server.ts`). It does **not** speak the json-server
dialect; it uses the supabase-js query builder:

- **list** → `from("products").select("*", { count: "exact" }).range(from, to)` where
  `from = (page-1)*pageSize`, `to = from + pageSize - 1`. The `count: "exact"` gives the
  filtered total (PostgREST returns it in `Content-Range`; supabase-js surfaces it as
  `{ count }`) — this replaces `X-Total-Count`. Return `{ rows, total: count }`.
  - **search** (`q`): `.or("name.ilike.%q%,sku.ilike.%q%,category.ilike.%q%")` — the
    same searchable whitelist as the contract (case-insensitive `ilike`, OR across
    `name`/`sku`/`category`). Escape `%`/`,` in user input.
  - **filter** (`status`): `.eq("status", value)` — only the whitelisted `status` key.
  - **sort** (`_sort`/`_order`): `.order(column, { ascending })` where `column` is
    looked up in a **whitelist map** `{ name, category, price, stock, createdAt:"created_at" }`;
    anything else → fall back to `.order("created_at", { ascending: false })` (default).
    Never pass raw user input as the column.
- **getOne** → `.select("*").eq("id", id).maybeSingle()`; `null` when no row (maps the
  frontend's `404 → null`).
- **create** → `.insert(serialize(input)).select().single()`.
- **update** → `.update(serialize(input)).eq("id", id).select().maybeSingle()`; a `null`
  result (no matching row, or one the user's RLS can't touch) **throws not-found** — a
  write to a missing id must surface as 404, not silently succeed (mirrors
  `restRepository`, whose PATCH on a missing item throws).
- **remove** → `.delete().eq("id", id).select()`; an **empty** result means nothing
  matched, which likewise **throws not-found** (a bare `.delete()` is a silent 0-row
  no-op, which would mask a stale/forbidden id).

`map(raw)` converts snake_case → camelCase (and `Number(raw.price)`); `serialize(input)`
converts camelCase → snake_case (only `createdAt`/`updatedAt` need renaming, and those
are server-owned so they're omitted from writes — the DB default + trigger set them).

**The default data path exercises RLS.** The repository's client is built **per request**
with the **anon key + the signed-in user's JWT** (forwarded from the request's Supabase
auth cookie via `@supabase/ssr`'s `createServerClient`), so every PostgREST call runs as
the `authenticated` role and the table's RLS policies are actually enforced. The
**service-role key bypasses RLS** and is therefore reserved for **explicit admin
operations** only (the example ships a lazily-built `adminClient()` for that) — using it
on the per-user CRUD path would silently defeat the policies. Either way the key/JWT
never leaves the server.

### Auth — Supabase `AuthProvider` + `auth-client`

Implements the same `AuthProvider` interface (`getSession(headers)` / `handler(request)`)
the dashboard already uses, normalising to `AuthSession` = `{ user: { id, email, name } }`:

- **`auth-client` (browser)** — built on the supabase-js browser client
  (`createBrowserClient` from `@supabase/ssr`). Exposes the same
  `signIn` / `signUp` / `signOut` / `useSession` surface the rest of the app imports:
  - `signIn` → `supabase.auth.signInWithPassword({ email, password })`
  - `signUp` → `supabase.auth.signUp({ email, password, options: { data: { name } } })`
  - `signOut` → `supabase.auth.signOut()`
  - `useSession` → subscribe to `supabase.auth.onAuthStateChange`, map to `{ user }`.
- **`AuthProvider.getSession(headers)`** — build a server client with
  `createServerClient` (`@supabase/ssr`), reading the Supabase auth cookie out of the
  request `headers`, call `supabase.auth.getUser()`, and normalise:
  `{ user: { id, email, name: user.user_metadata.name ?? "" } }`, or `null` if no user.
  Use `getUser()` (verifies the JWT against Supabase) — not `getSession()` — for the
  guard. **This is the real SSR refresh point:** the server client's `setAll` writes any
  rotated session cookies back onto the outgoing response (via TanStack Start's ambient
  `setCookie`), so when `getUser()` transparently refreshes an expired access token the
  browser keeps a live session. (A no-op `setAll` would refresh the token and then throw
  it away, leaving the next request with a stale cookie.)
- **`AuthProvider.handler(request)`** — Supabase Auth runs on the Supabase origin, so
  the frontend's `/api/auth/*` route is **not** a full auth host: the browser client
  signs in/out against `${SUPABASE_URL}/auth/v1/*` directly. The `handler`'s one job is
  to **service the SSR cookie/session-refresh exchange** — it builds the same per-request
  server client, calls `getUser()` (which refreshes and writes the rotated cookies via
  `setAll`), and returns `204`, so the refreshed `Set-Cookie` headers ride back on the
  response. It is not a 404 stub.

`name` is carried in Supabase's `user_metadata.name` (set at sign-up via
`options.data.name`); the frontend reads it back from `user_metadata`.

### Env the wiring needs

Server: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (the default RLS-respecting data path + the
auth guard), `SUPABASE_SERVICE_ROLE_KEY` (admin-only, optional). Browser:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (the auth-client). See `.env.example`.

## Verify

The **SQL layer** is validated against a bare Postgres: migration idempotency, RLS
enabled + forced, the `authenticated`-only CRUD policies (anon denied), the `updated_at`
trigger, and the check constraints. The seed loads all 12 demo rows.

The **frontend wiring** (`frontend-wiring/*`) ships as copy-ready files typechecked in
isolation against the real `@supabase/*` types — this repo has no Supabase stack or test
harness, so the wiring is **not** auto-verified here. To exercise it end-to-end, copy the
files into a dashboard (per `frontend-wiring/README.md`), `supabase start && supabase db
reset`, set the env, and check:

- **data path runs under RLS** — the repository's anon-key + user-JWT client lists /
  searches / filters / sorts / paginates and create→getOne→update→remove as the
  `authenticated` role; an unauthenticated request (no JWT) is RLS-denied. `update` /
  `remove` on a missing id throw not-found rather than silently succeeding.
- **service-role stays admin-only** — `adminClient()` (RLS-bypassing) is not on the CRUD
  path.
- **auth** — `signUp`→`signInWithPassword`→`getUser` returns `user_metadata.name`; an
  expired access token is refreshed by `getSession`/`handler` and the rotated cookies are
  written back on the response.
