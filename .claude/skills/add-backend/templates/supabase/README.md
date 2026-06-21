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
| `.env.example` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. |

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

| Var | Where used | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | frontend (data + auth) | Project API URL. Local: `http://127.0.0.1:54321`. Hosted: `https://<ref>.supabase.co`. |
| `SUPABASE_ANON_KEY` | frontend (browser + server) | Public key; safe in the browser. RLS gates it. |
| `SUPABASE_SERVICE_ROLE_KEY` | frontend (**server only**) | Bypasses RLS. Never expose to the browser. Optional if you forward the user JWT to the anon client instead. |

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
- **update** → `.update(serialize(input)).eq("id", id).select().single()`.
- **remove** → `.delete().eq("id", id)`.

`map(raw)` converts snake_case → camelCase (and `Number(raw.price)`); `serialize(input)`
converts camelCase → snake_case (only `createdAt`/`updatedAt` need renaming, and those
are server-owned so they're omitted from writes — the DB default + trigger set them).

The server-side client is created with the **service-role key** on the trusted
server-to-server hop (the fetch runs inside a server fn that already called
`requireUser()`), **or** with the anon key plus the forwarded user JWT. Either way the
key/JWT stays server-side.

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
  guard.
- **`AuthProvider.handler(request)`** — Supabase Auth runs on the Supabase origin, so
  the frontend's `/api/auth/*` route is **not** a full auth host here. The browser
  client talks to `${SUPABASE_URL}/auth/v1/*` directly; the cookie is written via the
  `@supabase/ssr` cookie adapter on the frontend origin. The `handler` only needs to
  service the SSR cookie/session refresh exchange (or return `404` for unused
  sub-paths). Map the Supabase user → `{ user }` consistently with `getSession`.

`name` is carried in Supabase's `user_metadata.name` (set at sign-up via
`options.data.name`); the frontend reads it back from `user_metadata`.

### Env the wiring needs

`SUPABASE_URL`, `SUPABASE_ANON_KEY` (browser + server), `SUPABASE_SERVICE_ROLE_KEY`
(server only). See `.env.example`.

## Verify

Verified end-to-end against a **live local stack** (`supabase start && supabase db reset`):
the shipped `frontend-wiring/supabase-repository.ts` driving real PostgREST does
list/search/filter/sort/pagination/count + create→getOne→update→remove; anon `select` is
RLS-denied while `authenticated` reads all 12 seed rows; and Supabase Auth
`signUp`→`signInWithPassword`→`getUser` returns `user_metadata.name`. The SQL itself
(migration idempotency, RLS forced, policies, trigger, check constraints) was also
validated against a bare Postgres. Re-run with `supabase start && supabase db reset`, then
exercise the wiring against the printed API URL + keys.
