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

## 3. Pick a data source per entity → skill `add-data-source`

Every page archetype is written against the `Repository<T, TInput>` interface,
so each entity just binds a backend in its `server.ts`:

- **Postgres** (default) — `drizzleRepository` + a Drizzle table.
- **REST** — `restRepository` (no DB table; proxies an external JSON API).
- **GraphQL** — `graphqlRepository`.

See `docs/data-adapters.md`. Adapters run only in server fns, so secrets stay
server-side.

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
