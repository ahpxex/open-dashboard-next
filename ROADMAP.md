# Roadmap — from "starter template" to "agent-portable admin substrate"

> **North star:** hand this repo's URL to an agent, point it at a target product,
> and it composes the app you need from a known vocabulary of admin *shapes*,
> guided by `.claude/` skills and prescriptive docs.
>
> **Success test:** an agent can add a new resource, a new page shape, swap the
> data source, and rebrand — without reverse-engineering the codebase, and it can
> run `bun test` to prove it didn't break anything.

This document is the plan. The companion [`PATTERNS.md`](./PATTERNS.md) is the
catalogue of shapes (what an agent composes from).

---

## Where we are today (honest baseline)

Implemented and verified (Phases 1–4):

- **Stack**: TanStack Start + Router + Query + Table, Drizzle + Postgres,
  better-auth, shadcn-on-`@base-ui/react`, Tailwind v4.
- **Atoms**: form system (TanStack Form + zod), toast (sonner), `useConfirm`,
  chart components, `appConfig` rebrand surface — all unit-tested.
- **Data adapters**: `Repository<T, TInput>` + `drizzleRepository` /
  `restRepository` / `graphqlRepository`; `products`/`orders` on Drizzle, `posts`
  on REST.
- **Page archetypes**: CRUD table (URL-synced, debounced search, bulk select),
  Detail/Show, Master-detail split, Card/grid list — each wired to a real resource.
- **Generator**: `create-resource` emits the full pattern (repository, URL state,
  form, confirm, toast), auto-formatted.
- **Agent layer**: `.claude/skills/*`, `.claude/commands/*`, `PATTERNS.md`,
  `PORTING.md`, prescriptive `CLAUDE.md`, `docs/data-adapters.md`.

Not yet built (Phase 5 — hardening):

- **RBAC** (`role` + `requireRole` gate + UI permission helper).
- **CI** (GitHub Actions: typecheck + lint + build + test with a Postgres service).
- **Playwright** smoke tests (Vitest units exist; e2e is manual via Chrome MCP).

(Porting is now **scaffold-first**: `scaffold-dashboard` stands up a clean,
demo-free, gallery-free base via `build-base.ts`, so there is nothing to strip —
you ADD what you need rather than cloning the full repo and pruning it.)

---

## Target architecture (layers)

```
Layer 0 — ATOMS              ui/* primitives · form system (rhf+zod+<Field>) · toast ·
                             confirm-dialog · chart components · date/combobox/upload ·
                             app config + theme tokens
Layer 1 — DATA ACCESS        Repository<T> interface + adapters (drizzle | rest|graphql) ·
                             ListParams/ListResult · requireUser · RBAC gate ·
                             exposed through createServerFn (secrets stay server-side)
Layer 2 — PATTERNS           page archetypes that compose L0 + L1:
                             CRUD table · Detail/Show · Master-detail · Card list ·
                             Form page · Chart page  (URL-synced state, query hooks)
Layer 3 — RESOURCES          features/<name>: schema + repository binding + queries +
                             the pattern(s) it uses + columns/cards/fields/config
Layer 4 — APP                routes · nav/sidebar config · app.config (brand) · auth

CROSS-CUTTING — AGENT LAYER  .claude/skills/* · .claude/commands/* ·
                             CLAUDE.md (prescriptive) · PATTERNS.md (catalogue) ·
                             PORTING.md · tests + CI (the safety net)
```

Key idea: **patterns are written against the `Repository` interface, not against
Drizzle.** A resource declares which adapter backs it. That is what makes the
shapes portable to a different backend.

---

## Design principles (the discipline)

1. **Thin and copy-friendly over clever.** A pattern is a small, readable
   reference you copy, not a deep framework you configure. Abstract a thing only
   after it has been needed ~twice.
2. **Consistency > feature count.** For an agent, 6 patterns that all look the
   same beat 30 that don't. Every pattern shares: `ListParams`, query-key shape,
   `requireUser`, URL state, error/empty/loading conventions.
3. **One canonical example per pattern, always wired to a real resource** — never
   a dead demo. The example *is* the documentation.
4. **URL is the source of truth** for list state (filters/sort/page/selection) via
   `validateSearch`, so views are shareable and back/forward works.
5. **Server functions are the only data boundary.** Adapters + secrets never reach
   the browser bundle (enforced by the `require-user` style server-only split).
6. **Every shape has a reference doc.** The shapes are catalogued as components in
   the `add-component` skill (each a `references/<name>.md` doc). If an agent can't
   add a shape by following its doc, the shape isn't done.
7. **Scaffold-first, not clone-and-strip.** A real product starts from a clean
   base: `scaffold-dashboard` ships the platform shell with the demo resources
   (`products`/`orders`/`posts`), the Skills Gallery, and dev-only scripts already
   stripped by `build-base.ts`. You ADD the resources and shapes you need rather
   than cloning the full repo and pruning it.

---

## Phased plan

Each phase ends green (`tsc` + `biome` + `build`) and, from Phase 5 on, with
passing tests. The chosen priorities from planning are marked **★**.

> **Status:** Phases 1–4 are ✅ complete (built, unit-tested, demoed on real
> pages, and Chrome-MCP e2e-verified). Porting is now scaffold-first (the clean
> base ships demo-free / gallery-free via `build-base.ts`); Phase 5 (RBAC / CI /
> Playwright) remains.

### Phase 1 — Atoms / foundations ✅
*Everything else reuses these; build them first.*
- **Form system**: `@tanstack/react-form` + `zod` (Standard Schema) validators + reusable
  `<Form>` / `<FormField>` bound to the existing `ui/field`. Refactor the products dialog
  onto it as the reference.
- **Toast** (`sonner`) mounted in the shell; success/error on mutations.
- **`<ConfirmDialog>`** + a `useConfirm()` hook — replace `window.confirm`.
- **URL-synced table state**: move page/pageSize/search/sort/filters into route
  `validateSearch`; refactor `products`/`orders`.
- **Chart components**: extract `AreaChart`/`BarChart`/`PieChart`/`StatCard` from the
  dashboard into `components/charts/*` (themed, responsive, shared tooltip/legend).
- **App config + rebrand**: `src/config/app.ts` (name, logo, nav source, theme); remove
  hardcoded `"Open Dashboard"`.

### Phase 2 — Data-source adapter ★ (portability-critical) ✅
- `Repository<T, TInput>` interface (`list/getOne/create/update/remove`) +
  `ListParams`/`ListResult` in `src/infra/data`.
- `drizzleRepository(table, { searchColumns, sortColumns })`; refactor `products`/`orders`
  server fns to use it (no behaviour change).
- `restRepository<T>({ baseUrl, path, map })`; add one example resource backed by a public
  REST API (e.g. `posts` via jsonplaceholder) to prove the path end-to-end.
- Document the GraphQL variant (same interface, different adapter).

### Phase 3 — Page-shape vocabulary ★ ✅
*The three prioritised archetypes, each a reusable pattern + a real wired example.*
- **Detail / Show** (`/<resource>/$id`): load one record + related data, edit entry point.
- **Master-detail / nested**: list + side-panel or record-scoped tabs (nested routes).
- **Card / grid list**: gallery of cards reusing the same query/filter/paginate plumbing
  as `DataTable` (shared `useResourceList` hook).
- **Bulk select + bulk actions** on the table (row selection in URL state).

### Phase 4 — Agent layer (the differentiator) ✅
- `.claude/skills/`: the current 7 skills — `scaffold-dashboard`, `rebrand`,
  `add-crud-resource`, `add-data-source`, `add-backend-preset`, `add-tests`, plus
  the `add-component` umbrella skill — a catalogue of 35+ UI shapes (`add-form`,
  `add-card-list`, `add-master-detail`, `add-detail-page`, `add-chart-page`,
  `add-kanban`, …), each a `references/<name>.md` doc. Each entry: when-to-use,
  exact files, the canonical example, invariants, verify step.
  *(The shapes originally shipped as one skill per shape; they were later consolidated
  into the single `add-component` catalogue.)*
- `.claude/commands/`: slash wrappers for the high-frequency ones.
- Keep [`PATTERNS.md`](./PATTERNS.md) as the machine-readable index, in sync with reality.
- `PORTING.md`: how to start a real product from a clean scaffold (scaffold-dashboard →
  rebrand → pick a backend → add resources & shapes).
- Make `CLAUDE.md` **prescriptive** (ALWAYS/NEVER + the invariants above).

### Phase 5 — Hardening
- **RBAC**: a `role` on users + a `requireRole`/route gate + a UI permission helper.
- **Tests**: Vitest (units: adapters, list-params) + Playwright smoke (auth → dashboard →
  CRUD → detail). This is the agent's safety net.
- **CI**: GitHub Actions (typecheck + lint + build + test) + a Postgres service.

---

## Resolved decisions
- **Form lib: TanStack Form** (`@tanstack/react-form`) — stays in the TanStack ecosystem
  alongside Router / Query / Table; zod wired via Standard Schema validators.
- **Toast: sonner** — drop-in, mounted once in the shell.
- **RBAC: simple `role` enum first** (e.g. `admin` / `member`) + a `requireRole` gate;
  org / multi-tenant added later only if a real project needs it.

---

## Definition of done (for the whole vision)
An agent, given only this repo + a target spec, can: scaffold a clean base,
rebrand, choose a backend, and assemble the target from the catalogue — each step
a documented skill — then prove it with `bun test`. When that round-trip works on a
real brief, the substrate is done.
