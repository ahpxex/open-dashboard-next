# Porting this template into a real product

Hand the `.claude/` skills to an agent with a product brief and it can compose
the app from a known vocabulary of admin *shapes*. This is the round-trip the
platform is built for. The model is **scaffold-first**: stand up a clean base in
a new project, then *add* only what the brief needs — you never clone the full
repo and prune it. Do it in five moves.

> Slash command: `/port <brief>` runs this end-to-end. Or follow it by hand.
>
> Want to see the shapes live before you build? `git clone` this repo and run
> `bun run dev` to browse the demos and the Skills Gallery — then build your
> product in a fresh scaffold (below). The repo is a reference, not the starting
> point.

## 1. Scaffold the base → skill `scaffold-dashboard`

Stand up the platform layer in a new project: UI primitives, the form system,
charts, the `Repository` + adapters, the auth seam, theme, and the routing/auth
shell — a zero-config runnable app. The base ships **demo-free and gallery-free**
(`build-base.ts` already strips the `products` / `orders` / `posts` demo
resources, the Skills Gallery, and the dev-only scripts), so there is nothing to
remove — you compose screens onto it from the `add-*` skills. `bun run dev`.

## 2. Rebrand → skill `rebrand`

Set the product name, logo, description, and theme in `src/config/app.ts`
(the single rebrand surface — sidebar, document title, auth pages all read it).
Edit navigation in `src/lib/sidebar-items.ts`; theme colours are CSS variables
in `src/styles/app.css`. `bun run check`.

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

| Need | Skill / component |
| --- | --- |
| List + create/edit/delete + bulk select | `add-crud-resource` |
| View one record | `add-detail-page` shape in `add-component` |
| Inbox / triage (list + side panel) | `add-master-detail` shape in `add-component` |
| Gallery of cards | `add-card-list` shape in `add-component` |
| Validated input | `add-form` shape in `add-component` |
| Metrics / overview | `add-chart-page` shape in `add-component` |

The shape rows above are reference docs inside the single `add-component`
catalogue (`add-component` → `references/<name>.md`); `add-crud-resource` is a
standalone operation skill.

Each skill points at the canonical example to copy (`products` is rich/Drizzle,
`orders` is master-detail/Drizzle, `posts` is card-list/REST). These live in the
source repo; if you cloned it to explore, copy the closest one — otherwise the
skill's reference doc carries the template.

## Definition of done

The brief's screens exist, each built from the catalogue (`PATTERNS.md`), and
`bun run typecheck && bun run check && bun run test && bun run build` are all
green. Nothing hardcodes the old brand.
