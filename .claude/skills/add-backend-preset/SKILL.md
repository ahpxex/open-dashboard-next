---
name: add-backend-preset
description: Point the app at a different backend (Supabase, an external REST/GraphQL API, a different SQL engine) by swapping the two seams — data (Repository) and auth (AuthProvider) — instead of editing the whole app. Use when a project's data/auth does not live in this template's default Postgres + better-auth.
---

# Add a backend preset

This template is **backend-agnostic by design**. The app reaches data and auth
only through two seams, so "use Supabase" / "use our Python API" is a localized
swap, not a rewrite:

| Concern | Seam | Default preset | Swap point |
| --- | --- | --- | --- |
| **Business data** (resources) | `Repository<T, TInput>` (`@/infra/data/repository`) | Postgres via `drizzleRepository`; in-memory when no DB | each resource's `server.ts` binding |
| **Auth** (server) | `AuthProvider` (`@/lib/auth-provider`) | better-auth (`betterAuthProvider`) | the `authProvider` binding |
| **Auth** (browser) | `@/lib/auth-client` | better-auth React client | reimplement that one file |

Two classes of data, two different rules:
- **Platform data** (users/sessions, later RBAC) is owned by the *auth preset* —
  swap it via `AuthProvider` + `auth-client`.
- **Business data** (your resources) is owned by each resource — swap it via the
  `Repository` adapter in `server.ts`.

Zero-config (`bun dev`, no `DATABASE_URL`) already runs on in-memory presets, so
you can build UI before wiring a real backend.

## When to use

- The data lives in an external REST/GraphQL API (bind `restRepository` /
  `graphqlRepository` — see `add-data-source` and `docs/data-adapters.md`).
- Auth is provided by Supabase, Clerk, or your own API issuing JWTs (implement a
  new `AuthProvider` + client).
- You want a different SQL engine (MySQL/SQLite/Turso) — Drizzle supports them;
  see `docs/backends.md` for the files to touch.

## Swap the data backend

Per resource, change only `server.ts`:

```ts
// REST-backed resource (no DB) — the rest of the vertical is unchanged
export const widgetsRepository = restRepository<Widget, WidgetInput>({
  baseUrl: process.env.WIDGETS_API_URL!,
  path: "/widgets",
  map: (raw) => ({ ...raw }),
});
```

Use `add-data-source` for the full walkthrough. `queries.ts`, `columns.tsx`, the
table/detail/form, and the route do not change.

## Swap the auth backend

Implement `AuthProvider` (server) and reimplement `@/lib/auth-client` (browser),
then point `authProvider` at your implementation. The `AuthProvider` contract:

```ts
export interface AuthProvider {
  getSession(headers: Headers): Promise<AuthSession | null>; // AuthSession = { user: { id; email; name; image? } }
  handler(request: Request): Promise<Response>;              // serves /api/auth/*
}
```

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
  handler: async (request) =>
    fetch(`${process.env.AUTH_API_URL}/auth${new URL(request.url).pathname.replace("/api/auth", "")}`, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    }),
};

export const authProvider: AuthProvider = externalApiAuthProvider;
```

## Invariants

- The app reaches auth ONLY via `authProvider` (server) and `@/lib/auth-client`
  (browser). Never call a specific auth SDK from a route or component.
- `getSession` returns the normalized `AuthSession` (`{ user: { id, email, name } }`)
  so `requireUser`, the `_app` guard, and the route context are backend-neutral.
- Keep the server seam server-only: `auth-provider.ts` may import DB/SDK clients,
  so it must only be reached from `require-user`, the api route, and the dynamic
  import in `auth-server` — never statically from a client-reachable module.
- Business data still goes through `Repository` + `requireUser` in `server.ts`.

## Verify

`bun run typecheck && bun run check && bun run test && bun run build`, then
`bun run dev` and confirm: an unauthenticated request to `/` redirects to
`/login`, sign-in works, and a protected page loads its data through the new
backend.
