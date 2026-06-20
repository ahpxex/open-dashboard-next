# Open Dashboard

> A full-stack back-office template that an **AI agent composes for you** — fork it, point it at a product, and it assembles your dashboard from a catalogue of 35+ copy-ready UI shapes. Every shape is proven by a live demo in the repo.

Most admin starters are one of two things: a pretty UI kit with no real backend, or a clone-and-hand-rewire boilerplate. **Open Dashboard is neither.** It is a real full-stack app *and* an **AI-native substrate**: the repo is the source of truth for a catalogue of **skills** (`.claude/skills/`) — CRUD tables, detail pages, kanban boards, calendars, wizards, billing, RBAC, i18n, and more — each a copy-ready UI *shape*. An agent (Claude Code) forks the repo and **composes** the product you need from those shapes instead of reverse-engineering a codebase.

It runs **zero-config**: `bun install && bun run dev` boots on in-memory adapters — no Docker, no Postgres. Add a `DATABASE_URL` to switch to real Postgres; the data and auth backends are swappable presets behind two seams.



## What makes it different

### A catalogue of shapes, not a fixed app

`.claude/skills/` holds one **`add-component`** skill — a catalogue + retriever over
**35+ copy-ready admin UI shapes** (`add-crud-resource`'s detail/master-detail/
card-list/chart-page archetypes, plus `add-form`, `add-kanban`, `add-calendar`,
`add-tree-view`, `add-timeline`, `add-wizard-form`, `add-inline-edit`,
`add-virtual-table`, `add-table-columns`, `add-saved-views`, `add-global-search`,
`add-rbac`, `add-billing`, `add-i18n`, `add-notifications`, `add-audit-log`, …) —
plus a handful of **operation skills** (`scaffold-dashboard`, `add-crud-resource`,
`add-data-source`, `add-backend-preset`, `rebrand`, `add-tests`). Each shape ships
a copy-ready template + a reference doc (the exact
`cp` + rewire steps, foundation, invariants). You build an app by **picking
shapes**, not by editing a monolith.

### The Skills Gallery is the proof

The sidebar's **Skills Gallery** renders one live demo per skill (grouped into
Forms / Lists & tables / Rich views / Detail & pages / Display & feedback). The
bundled skill code is generated **from** the repo's own working source and kept
byte-for-byte in sync — `bun run sync-skills --check` is the drift guard — so a
skill never ships code the repo hasn't typechecked, built, and tested. The gallery
*is* the proof that every skill produces working UI.

### Two real business cases (composition, not filler)

Above the gallery, two complete back-offices show the shapes composed into
believable verticals: **E-commerce** (products / orders / customers / refunds + a
store dashboard + blog) and **Sales (CRM)** (forecast / pipeline kanban / contacts
/ companies). `products` and `orders` are real Drizzle resources; the rest run on
the in-memory adapter — so the whole thing works with or without a database.

### Zero-config, swappable backend

With no `DATABASE_URL` the app boots on in-memory data + auth adapters (ideal for
`bun dev` and for the agent to iterate fast). Set `DATABASE_URL` for Postgres via
Drizzle. Both data (`Repository`) and auth (`AuthProvider`) are **seams**, so
pointing the app at Supabase, an external REST/GraphQL API, or a different SQL
engine is a preset swap — see [`docs/backends.md`](./docs/backends.md).

### Still a real full-stack app

Server functions (`createServerFn`) are the only data boundary; **better-auth**
gives real hashed-password auth + sessions; **Drizzle + Zod + TanStack Router**
make it type-safe from the database row to the route loader. No mock data.

## Tech Stack

### Full-stack framework

- **[TanStack Start](https://tanstack.com/start)** — full-stack React (Vite + Nitro), server logic in `createServerFn` server functions.
- **[TanStack Router](https://tanstack.com/router)** — type-safe, file-based routing.
- **[TanStack Query](https://tanstack.com/query)** — server-state caching and mutations.
- **[TanStack Table](https://tanstack.com/table)** — headless table primitives, wrapped by the generic `DataTable`.
- **React 19** + **TypeScript 5** (strict), **[Vite 7](https://vite.dev/)** dev/build, **Nitro** (`node-server`) for production.

### Database & auth (default backend, not a hard requirement)

- **[Drizzle ORM](https://orm.drizzle.team/)** + **PostgreSQL** via `node-postgres`; migrations & Studio via **[drizzle-kit](https://orm.drizzle.team/kit-docs/overview)**.
- **[better-auth](https://www.better-auth.com/)** — email + password, sessions in Postgres (Drizzle adapter) when `DATABASE_URL` is set, else better-auth's in-memory adapter.
- **In-memory adapters** back both data and auth with no `DATABASE_URL`, so the app is runnable zero-config.

### UI & state

- **[shadcn/ui](https://ui.shadcn.com/)** built on **[`@base-ui/react`](https://base-ui.com/)** (not Radix), **Tailwind CSS v4**, **[Phosphor Icons](https://phosphoricons.com/)**, light/dark via **[next-themes](https://github.com/pacocoursey/next-themes)**.
- **[Recharts](https://recharts.org/)** charts, **[Zustand](https://zustand-demo.pmnd.rs/)** client state, **[Zod](https://zod.dev/)** validation.

### Tooling

- **[Bun](https://bun.sh/)** (package manager + script runtime), **[Biome](https://biomejs.dev/)** (lint + format), **Vitest** (tests).

## Quick Start

### Zero-config (no database)

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **"Dev quick login"**.
The app runs on in-memory adapters — the business cases and every Skills-Gallery
demo work with **no Docker and no Postgres**. This is the fastest way to explore
the template (and how the agent iterates).

### With PostgreSQL (persistent)

Prerequisites: [Bun](https://bun.sh/) and [Docker](https://www.docker.com/) (for local Postgres).

```bash
bun run db:up        # start Postgres (docker compose up -d)
cp .env.example .env # defaults match the Docker setup above
bun run db:migrate   # apply migrations in ./drizzle
bun run db:seed      # ~60 demo products + a dev login account
bun run dev
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. Omit it to run on the in-memory backend. |
| `BETTER_AUTH_SECRET` | Secret used to sign sessions (`openssl rand -base64 32`). |
| `BETTER_AUTH_URL` | Server-side base URL (e.g. `http://localhost:3000`). |
| `VITE_BETTER_AUTH_URL` | Public base URL exposed to the browser auth client. |

Seeding creates a ready-to-use dev account (`dev@example.com` / `password`); in
development the login page also has a **"Dev quick login"** button (stripped from
production builds).

## Composing a product

You build a real product by **scaffolding a clean base, then composing** — you
*add* what you need rather than cloning the whole repo and pruning it. Each step
is backed by a skill:

1. **Scaffold** — stand up the platform shell in a **new** project: install the
   plugin (see below) and run `scaffold-dashboard`. The base is **demo-free and
   gallery-free** out of the box, zero-config runnable. Skill: `scaffold-dashboard`.
2. **Rebrand** — change name / logo / nav / theme in `src/config/app.ts`. Skill: `rebrand`.
3. **Pick a backend** — keep zero-config memory, set `DATABASE_URL` for Postgres, or swap a preset (Supabase / external API). Skill: `add-backend-preset` · [`docs/backends.md`](./docs/backends.md).
4. **Add resources** — `bun run create-resource <name>` scaffolds a full CRUD vertical (table + server fns + query hooks + `DataTable` page + create/edit dialog + sidebar entry). Skill: `add-crud-resource`.
5. **Add shapes** — compose detail pages, master-detail, kanban, charts, wizards, billing, etc. from the `add-component` catalogue.

> Prefer to explore first? You can also `git clone` the full repo — it boots with
> the demos + Skills Gallery so you can click through every shape live — then build
> your product in a fresh scaffold once you know which shapes you want.

The catalogue of shapes is in [`PATTERNS.md`](./PATTERNS.md); the full porting guide
is in [`PORTING.md`](./PORTING.md); agent guidance and the prescriptive
ALWAYS/NEVER conventions live in [`CLAUDE.md`](./CLAUDE.md).

## Installing the skills (CLIs & other agents)

Every skill is a standard [Agent Skill](https://github.com/anthropics/skills) — a
`SKILL.md` with `name` + `description` frontmatter under `.claude/skills/<name>/` —
so any skills CLI or agent can ingest the catalogue straight from this repo:

```bash
# Vercel's skills.sh
npx skills add ahpxex/open-dashboard-next
# or OpenSkills (Claude Code, Cursor, Codex, Windsurf, Aider — anything reading SKILL.md / AGENTS.md)
npx openskills install ahpxex/open-dashboard-next
```

The Agent Skills format is agent-agnostic, so **Cursor, OpenAI Codex, Windsurf,
Aider** and other agents can load and follow these skills too.

**Claude Code plugin** — the repo ships a
[`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json), so Claude
Code users can install the whole catalogue natively (the `add-component` shape
catalogue + the operation skills):

```
/plugin marketplace add ahpxex/open-dashboard-next
/plugin install open-dashboard@open-dashboard
```

Each skill is then available namespaced under the plugin (e.g.
`open-dashboard:add-component`), so it never collides with other installed skill packs.

> **These are substrate-coupled skills, not standalone drop-ins.** Each *shape*
> skill ships a `templates/*` file that imports this repo's platform layer
> (`@/components/ui`, `@/lib/toast`, the form system, theme tokens) and assumes the
> foundation that **`scaffold-dashboard`** stands up. So the real unit of reuse is
> the *substrate*: run `scaffold-dashboard` first (it bundles the runnable base), or
> fork this repo, **then** compose the shape skills on top. Installing one shape
> skill into an unrelated project gives you the instructions plus a template that
> won't compile without the base — that's expected, not a bug.

## Project Structure

```
open-dashboard-next/
├── .claude/
│   ├── skills/              # add-component (35+ UI shapes) + operation skills
│   └── commands/            # /add-resource, /port
├── docs/                    # backends, data-adapters, resources, gallery-catalogue
├── drizzle/                 # Generated SQL migrations
├── scripts/
│   ├── seed.ts              # Demo seeder (bun run db:seed)
│   ├── create-resource.ts   # CRUD generator (bun run create-resource)
│   ├── sync-skills.ts       # Generate each skill's templates/ from repo source (--check = drift guard)
│   └── build-base.ts        # Assemble the scaffold-dashboard base bundle
├── src/
│   ├── components/          # App shell, charts, form system, shadcn/ui (components/ui)
│   ├── config/app.ts        # The single rebrand surface (name / logo / nav / theme)
│   ├── db/schema.ts         # Drizzle tables (better-auth tables + products + orders)
│   ├── features/            # Resources: products, orders, posts, customers, refunds, deals, contacts, companies
│   ├── infra/
│   │   ├── data/            # Repository interface + drizzle / rest / graphql / memory adapters
│   │   ├── table/           # Generic DataTable (toolbar + pagination)
│   │   ├── list/            # CardList + useResourceList
│   │   └── ui/              # Shared cells (StatusChip, ActionMenu)
│   ├── lib/                 # auth seam (auth-provider/-client/-server), sidebar-items, toast, backend
│   ├── routes/
│   │   ├── __root.tsx       # Root document + providers
│   │   ├── _app.tsx         # Auth-guarded dashboard shell
│   │   ├── _app/            # Protected pages: the two business cases + gallery/* (Skills Gallery demos)
│   │   ├── _auth/           # login, register
│   │   └── api/auth/$.ts    # better-auth HTTP handler
│   └── styles/              # Tailwind entry
├── CLAUDE.md                # Agent guidance (prescriptive ALWAYS/NEVER + conventions)
├── PATTERNS.md              # The shape catalogue
├── PORTING.md               # How to start a real product
└── vite.config.ts           # Vite + TanStack Start + Nitro plugins
```

## Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Start the dev server on port 3000 (zero-config if no `DATABASE_URL`). |
| `bun run build` / `bun run start` | Production build / run the Nitro server. |
| `bun run check` / `lint` / `format` | Biome. |
| `bun run typecheck` / `bun run test` | `tsc --noEmit` / Vitest. |
| `bun run db:up` / `db:down` | Start / stop local Postgres (Docker Compose). |
| `bun run db:generate` / `db:migrate` / `db:push` / `db:studio` | Drizzle migrations & Studio. |
| `bun run db:seed` | Seed demo products + a dev account (`dev@example.com` / `password`). |
| `bun run create-resource <name>` | Scaffold a new CRUD resource. |
| `bun run sync-skills` / `sync-skills --check` | Regenerate skill `templates/` from repo source / verify they're in sync (template maintenance). |
| `bun run build-base` | Reassemble the `scaffold-dashboard` base bundle (template maintenance). |

## Deployment

```bash
bun run build
bun run start   # node .output/server/index.mjs
```

Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and
`VITE_BETTER_AUTH_URL` in your hosting environment, and run `bun run db:migrate`
against your production database before first boot.

## Contributing

Contributions are welcome — open issues, submit PRs, and star the repo if it helps you.

## License

MIT.
