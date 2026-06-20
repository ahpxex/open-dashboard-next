---
name: scaffold-dashboard
description: Stand up the dashboard foundation (the platform layer — UI primitives, form system, charts, Repository + adapters, auth seam, theme, routing shell) into a new project as a zero-config runnable app. Run this FIRST when building a dashboard, then compose screens from the add-* shape skills.
---

# Scaffold the dashboard foundation

The whole foundation is **bundled** at `base/` — a clean, runnable app shell with
no demo content. Materialize it into a new project, then add screens with the
`add-*` skills. You don't read the foundation code — you scaffold it.

## Scaffold

```bash
bash .claude/skills/scaffold-dashboard/scaffold.sh <target-dir>
```

Copies `base/` → target and runs `bun install`. Then:

```bash
cd <target-dir>
bun run dev          # zero-config: in-memory auth + data, no Postgres/Docker
```

Open it, click **Dev quick login** (`dev@example.com` / `password`) → an empty,
branded dashboard.

## What you get

TanStack Start + Router + Query + Table; shadcn-on-`@base-ui/react` primitives;
Tailwind v4 theme; the form system (TanStack Form + zod); chart components; the
`Repository` data layer (in-memory by default, Drizzle/Postgres when `DATABASE_URL`
is set); better-auth behind the `AuthProvider` seam; toast + `useConfirm`; and the
auth-guarded routing shell. Rebrand via `src/config/app.ts` (or the `rebrand` skill).

## Compose a coherent product (not a demo dump)

You are building a real back-office for a specific domain — not showcasing the
catalogue. The fastest way to ship something that reads as a patchwork demo is to
copy a pile of gallery shapes into the nav. Don't. Instead:

- **The home is an overview, never the placeholder.** Replace
  `src/routes/_app/index.tsx` (the "clean shell" welcome) with a real overview via
  `add-chart-page` — KPIs + charts derived from your actual resources. Shipping the
  scaffold welcome as the product home is the #1 tell of a demo.
- **Nav = real product sections only:** Overview, your resources, Settings. The
  scaffold base ships clean (no demo resources, no Skills Gallery) — you add
  product sections to `src/lib/sidebar-items.ts`, you don't prune sample ones.
- **Pick the archetype that fits each resource's shape**, don't add one of each:
  flat list → CRUD table (`add-crud-resource`); rich record → + `add-detail-page`;
  an inbox you triage → `add-master-detail`; a staged pipeline → `add-kanban`;
  people/visual items → `add-card-list`; date-bound items → `add-calendar`;
  metrics → `add-chart-page`.
- **Every nav item gets a distinct, meaningful Phosphor icon** — never repeat one
  icon (e.g. `SquaresFourIcon`) down the list.
- **Use product language.** Labels and page copy name the domain, not the
  mechanism: "Feed", not "Feed (REST)"; "Manage your invoices", not "Generated
  resource — customise the schema".
- **Seed believable data** — real names, dates, statuses, amounts. Three rows of
  `Alpha/Beta/Gamma` read as a demo; a dozen realistic records read as a product.

## Add screens (compose from the shape skills)

Each shape skill copies a bundled template into the new project:

- **Resources** (data + CRUD): `bun run create-resource <name>` (or `add-crud-resource`),
  then `add-detail-page`, `add-master-detail`, `add-card-list`, `add-form`, `add-chart-page`.
- **Shapes**: `add-list-view`, `add-kanban`, `add-tree-view`, `add-calendar`,
  `add-timeline`, `add-virtual-table`, `add-inline-edit`, `add-filter-panel`,
  `add-wizard-form`, `add-field-combobox`, `add-record-tabs`, `add-settings-page`,
  `add-empty-state`, `add-page-layout`, `add-data-display`, `add-feedback-states`.

After copying a template, add a sidebar entry in `src/lib/sidebar-items.ts` (above
the `// create-resource:anchor`) so it shows in the nav.

## Verify

```bash
cd <target-dir>
bun run typecheck && bun run check && bun run test && bun run build
```

All green on the empty shell (and after each screen you add). `bun run dev` boots
zero-config.
