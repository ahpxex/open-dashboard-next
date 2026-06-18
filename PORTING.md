# Porting this template into a real product

Hand this repo (and its `.claude/` skills) to an agent with a product brief and
it can compose the app from a known vocabulary of admin *shapes*. This is the
round-trip the platform is built for. Do it in four moves.

> Slash command: `/port <brief>` runs this end-to-end. Or follow it by hand.

## 1. Rebrand → skill `rebrand`

Set the product name, logo, description, and theme in `src/config/app.ts`
(the single rebrand surface — sidebar, document title, auth pages all read it).
Edit navigation in `src/lib/sidebar-items.ts`; theme colours are CSS variables
in `src/styles/app.css`. `bun run check`.

## 2. Strip the demo → skill `strip-demo`

Remove the `products` / `orders` / `posts` demo resources and the sample
dashboard, leaving a clean, branded shell. Keep everything under
`src/components`, `src/infra`, `src/config`, `src/lib`, the routing/auth shell,
and the generator. Migrate away the demo tables. `bun run typecheck && check`.

## 3. Pick the backend → skills `add-data-source`, `add-backend-preset`

The app reaches data and auth through two seams, so the backend is a swappable
preset — not something baked in. With no `DATABASE_URL` everything runs on
in-memory adapters, so you can build before wiring a real backend.

**Data** — every archetype is written against `Repository<T, TInput>`, so each
entity binds a backend in its `server.ts`:

- **Postgres** (default) — `drizzleRepository` + a Drizzle table (in-memory with no DB).
- **REST** — `restRepository` (no DB table; proxies an external JSON API).
- **GraphQL** — `graphqlRepository`.

**Auth** — if the project's auth isn't better-auth + Postgres (e.g. Supabase, or
an external API issuing JWTs), implement an `AuthProvider` (`src/lib/auth-provider.ts`)
and reimplement `src/lib/auth-client.ts`. The pages, guard, and `requireUser`
don't change.

See `docs/data-adapters.md` (data) and `docs/backends.md` (the full backend-preset
model). Adapters/providers run only server-side, so secrets stay off the client.

## 4. Assemble the resources and shapes

For each entity in the brief, scaffold the vertical and add the page shapes it
needs:

| Need | Skill |
| --- | --- |
| List + create/edit/delete + bulk select | `add-crud-resource` |
| View one record | `add-detail-page` |
| Inbox / triage (list + side panel) | `add-master-detail` |
| Gallery of cards | `add-card-list` |
| Validated input | `add-form` |
| Metrics / overview | `add-chart-page` |

`products` (rich, Drizzle), `orders` (master-detail, Drizzle), and `posts`
(card list, REST) are the canonical examples — copy the closest one.

## Definition of done

The brief's screens exist, each built from the catalogue (`PATTERNS.md`), and
`bun run typecheck && bun run check && bun run test && bun run build` are all
green. Nothing hardcodes the old brand; no demo resource remains.
