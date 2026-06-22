# Deploy a no-login demo to Cloudflare Workers

This app is a TanStack Start SSR app with server functions. Its first-class target
is a **Node server** (`bun run build` → `.output/`, run with `bun run start`). It
**also** ships a Cloudflare Workers build for a public, **no-login** showcase.

Two things make the Cloudflare demo work:

1. **No-login mode** (`VITE_SKIP_AUTH=1`) — bypasses the auth guard, `requireUser()`,
   and the user menu, running every request as a fixed demo user (`src/lib/demo-mode.ts`).
   The whole better-auth / Postgres / `pg` chain is then never loaded at runtime, so
   the Workers bundle stays clean. This is appropriate on serverless: Workers isolates
   are ephemeral and not shared, so a real session store wouldn't persist anyway.
2. **The official `@cloudflare/vite-plugin`** (`DEPLOY_TARGET=cloudflare`) — builds for
   the `workerd` runtime and provides the `AsyncLocalStorage` context that TanStack
   Start server functions need during SSR. (The older Nitro `cloudflare-pages` preset
   builds but 500s at runtime with *"No Start context found in AsyncLocalStorage"* — so
   we use the Cloudflare plugin instead, deploying as a **Worker**, not a Pages project.)

Data is in-memory (`memoryRepository` + each resource's `demo-data.ts`), seeded per
isolate. Reads work; writes are ephemeral — fine for a showcase.

## Local build / preview

```bash
bun run build:cf      # DEPLOY_TARGET=cloudflare VITE_SKIP_AUTH=1 vite build  → dist/
bun run preview:cf    # serve the build on the real workerd runtime (pre-deploy check)
```

`preview:cf` runs the built worker in `workerd` locally — the closest thing to
production. Use it to confirm the dashboard renders without logging in before deploying.

## Deploy from the CLI

```bash
bun run deploy:cf     # build:cf && wrangler deploy   (needs `wrangler login` once)
```

## Deploy via the Cloudflare dashboard (Workers Builds, Git-connected)

Create a **Worker** (not a Pages project) and connect this repo. Then set:

| Setting | Value |
| --- | --- |
| **Build command** | `bun run build:cf` |
| **Deploy command** | `npx wrangler deploy` (the default) |
| **Runtime config** | from `wrangler.jsonc` — `nodejs_compat`, assets, etc. |

### Environment variables (important)

- **Do NOT set `DATABASE_URL`.** With it unset, `hasDatabase` is `false`, so the app
  uses the in-memory adapters. Setting it would route resources to Postgres/`pg`, which
  cannot run on `workerd`.
- `VITE_SKIP_AUTH=1` is already baked in by `build:cf`, so you don't need to add it in
  the dashboard. (It's a build-time flag — it must be present when `vite build` runs,
  not at runtime.)
- `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` are **not** needed (auth is bypassed).

## Files involved

- `wrangler.jsonc` — Worker config (`nodejs_compat`, `main`, assets). Committed.
- `vite.config.ts` — swaps in `@cloudflare/vite-plugin` when `DEPLOY_TARGET=cloudflare`.
- `src/lib/demo-mode.ts` — the `VITE_SKIP_AUTH` flag + the demo user.
- `src/lib/stubs/pg-native.cjs` — stubs `pg`'s optional native client for the bundler.

## Reverting to the normal authenticated app

Nothing to revert — the default build is unchanged. `bun run build` / `bun run start`
still produce and run the Node server with full better-auth login. The Cloudflare bits
only activate under `DEPLOY_TARGET=cloudflare` + `VITE_SKIP_AUTH=1`.
