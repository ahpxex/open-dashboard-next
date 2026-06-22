# Open Dashboard

**English** · [简体中文](./README.zh-CN.md)

> A catalogue of **36 copy-ready admin UI shapes** — CRUD tables, detail &
> master-detail pages, kanban, calendar, wizard, charts, billing, RBAC, i18n, and
> more — that an AI agent **installs and composes** into a real back-office.

Open Dashboard is a **skill catalogue**, not a boilerplate you clone and gut. The
skills live in `.claude/skills/`; an agent (Claude Code, Cursor, Codex, …) installs
them and assembles the dashboard you need from the shapes — instead of
reverse-engineering a codebase. Every shape is a real, tested component, proven by a
live demo in the repo.

![The store overview — KPIs, a revenue trend, and charts, composed from the catalogue and rendered with the platform's chart system.](docs/dashboard.png)

## Install the skills

### Claude Code

```
/plugin marketplace add ahpxex/open-dashboard
/plugin install open-dashboard@open-dashboard
```

Skills are then namespaced under the plugin (e.g. `open-dashboard:add-component`), so
they never collide with other packs.

### Any other agent (Cursor, Codex, Windsurf, Aider, …)

The skills are standard, agent-agnostic `SKILL.md` files:

```bash
npx openskills install ahpxex/open-dashboard   # reads SKILL.md / AGENTS.md
npx skills add ahpxex/open-dashboard            # Vercel skills.sh
```

> The shapes assume the **`scaffold-dashboard`** foundation (the platform layer they
> import). Run that first — or fork this repo — then compose the shapes on top. A
> single shape copied into an unrelated project ships the instructions plus a
> template that won't compile without the base; that's expected.

## What you get

- **`add-component`** — a catalogue + retriever over **36 UI shapes**, grouped:
  *Forms · Lists & tables · Rich views · Detail & pages · Display & feedback ·
  Platform* (RBAC / social auth / ⌘K search / i18n / billing / realtime). Each shape
  is a copy-ready template plus a reference doc with the exact `cp` + rewire steps,
  the foundation it assumes, and its invariants.
- **Operation skills** — `scaffold-dashboard` (stand up the foundation),
  `add-backend` (the data layer + six runnable backend presets), `rebrand`
  (name / logo / nav / theme).

## Build a dashboard

Each step is one skill — you *add* what you need rather than prune a monolith:

1. **`scaffold-dashboard`** — stand up the clean, zero-config foundation in a new project.
2. **`rebrand`** — name, logo, nav, theme (`src/config/app.ts`).
3. **`add-backend`** — stay zero-config (in-memory), set `DATABASE_URL` for Postgres,
   or pick a preset (Hono / FastAPI / Supabase, with Drizzle / Prisma, better-auth /
   Auth.js / JWT). Data and auth are swappable behind two seams.
4. **`add-backend`** — `create-resource <name>` scaffolds a full CRUD vertical
   (table + server fns + query hooks + `DataTable` page + create/edit dialog + nav).
5. **`add-component`** — compose detail pages, master-detail, kanban, charts,
   wizards, billing, and the rest from the catalogue.

Walkthrough: [`PORTING.md`](./PORTING.md) · shape catalogue: [`PATTERNS.md`](./PATTERNS.md) ·
conventions: [`CLAUDE.md`](./CLAUDE.md) · backends: [`docs/backends.md`](./docs/backends.md).

## Explore the repo locally (optional)

The repo is itself a runnable app: every shape has a live demo in the **Skills
Gallery**, so you can click through the catalogue before composing. Two demo
back-offices — **E-commerce** and **Sales (CRM)** — show the shapes composed into
real verticals.

```bash
bun install
bun run dev   # zero-config: in-memory data + auth, no Docker, no Postgres
```

Open [http://localhost:3000](http://localhost:3000) → **Dev quick login**.

## How it stays honest

The bundled skill templates are **generated from the repo's own working source** and
kept byte-for-byte in sync (`bun run sync-skills --check`, enforced in CI). A shape
never ships code the repo hasn't typechecked, built, and tested — the gallery demo
*is* the test.

Built on TanStack Start (React 19 + Vite + Nitro), Drizzle + better-auth,
shadcn-on-[`@base-ui/react`](https://base-ui.com/) + Tailwind v4, with Bun, Biome,
and Vitest.

## Community

Built in the open and shared with the [linux.do](https://linux.do/) community —
questions, feedback, and show-and-tell are welcome there.

## License

MIT
