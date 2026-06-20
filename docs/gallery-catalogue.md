# Gallery catalogue

> The **Skills Gallery** is **repo-only proof**: a rich palette of working shapes
> the substrate typechecks/builds/tests/renders, so each shape is the live evidence
> its `add-component` reference produces working UI. It is **stripped from the
> scaffold base** by `build-base` — a scaffolded product starts gallery-free and
> **adds** the shapes it needs from `add-component`. All variants below are
> **built, green (typecheck/check/test/build), and zero-config runnable** — each is
> a self-contained route under `src/routes/_app/gallery/`, surfaced both by the
> tabbed **`Skills Gallery · Overview`** (`/gallery`, `gallery/index.tsx`) and by a
> per-shape sidebar entry under the `Skills · …` groups.
>
> **Where the shapes live as skills.** Every UI shape below is a **component in the
> single `add-component` skill** — its reference doc is
> `.claude/skills/add-component/references/<name>.md` and its copy-ready template is
> under `.claude/skills/add-component/templates/`. The component identifiers
> (`add-form`, `add-kanban`, …) live on as those reference docs; they are no longer
> standalone skill directories. The handful of names that remain **standalone
> skills** (`add-crud-resource`, `add-data-source`, `add-backend-preset`, …) are
> called out as such in the rows below.
>
> The sidebar's two **business-case groups** (E-commerce, Sales/CRM) **compose**
> these shapes into real back-offices — see the "Business cases" section of
> `CLAUDE.md`.

Legend: ✅ built & verified · the **Skill / component** column names either a
standalone `add-*` skill or a component (reference doc) inside `add-component`.

---

## The 3 hard rules (every variant must obey these, or the gallery hurts the agent)

1. **Same conventions as everything else.** `ListParams` shape, `Repository` +
   `AuthProvider` seams, query keys `["<res>","list",params]`, URL-synced state,
   explicit loading / empty / error. Consistency beats count (ROADMAP #2).
2. **Self-contained + independently strippable.** One route (+ one `features/<name>/`
   folder if it has data). Deleting it touches nothing else — this is what lets
   `build-base` drop the whole gallery from the scaffold base cleanly.
3. **Every variant is addable** — via a standalone `add-*` skill or, for the UI
   shapes, via its component reference doc in `add-component` — and has a catalogue
   row. If an agent can't add it, it isn't done (ROADMAP #6).

All variants run **zero-config** on the in-memory backend (`memoryRepository` +
better-auth memory adapter), so the whole gallery works on `bun dev` with no DB.

---

## Cross-cutting options (composable modifiers, defined once, reused everywhere)

These are **not** separate pages — they are toggles a list/form variant can turn
on. Each is documented once and demonstrated by ≥1 variant below.

| Option | Meaning | Demonstrated by |
| --- | --- | --- |
| `paginated` | server-side page/pageSize controls | Data table |
| `infinite` | load-more / infinite scroll, no pager | Infinite list |
| `lazy` | defer-load on viewport / on expand | Lazy list, Tabbed detail |
| `searchable` | debounced search box wired to `ListParams.search` | Data table, Combobox |
| `filterable` | faceted filters → `ListParams.filters` | Data table |
| `selectable` | row selection + bulk actions (transient local state) | Table bulk select |
| `sortable` | column/sort controls → `ListParams.sortBy/Dir` | Data table |
| `custom-actions` | configurable toolbar / row / footer buttons | Action toolbar |
| `scroll` vs `fixed` | scrollable body w/ sticky header/footer **vs** fit-to-viewport | Scroll form / Fixed form |
| `density` | comfortable / compact (lite) row height | List view (lite) |

---

## A. Lists & collections

| Variant | Demonstrates / options | Status | Files | Skill / component |
| --- | --- | --- | --- | --- |
| **Data table** | server paginate/sort/search/filter, CRUD, bulk select | ✅ | `features/products`, `routes/_app/products.tsx` | `add-crud-resource` (standalone skill) |
| **Card / grid gallery** | responsive card grid, same plumbing as table | ✅ | `features/posts` + `posts.tsx` | `add-card-list` component |
| **Master-detail split** | list stays mounted + side panel (selection in URL) | ✅ | `orders.tsx` + `orders.$id.tsx` | `add-master-detail` component |
| **List view (lite/dense)** | compact rows, leading icon/avatar, secondary text, no table chrome | ✅ | `routes/_app/gallery/list-lite.tsx` | `add-list-view` component |
| **Infinite / load-more list** | `infinite` option, cursor/offset, no pager | ✅ | `.../gallery/list-infinite.tsx` | `add-infinite-list` component |
| **Lazy list** | `lazy` — defer fetch until visible/expanded | ✅ | `.../gallery/list-lazy.tsx` | `add-list-view` component (option) |
| **Virtualized table** | windowed rows for large datasets (10k+) | ✅ | `.../gallery/table-virtual.tsx` | `add-virtual-table` component |
| **Kanban board** | columns + drag between, status = column | ✅ | `.../gallery/kanban.tsx` (self-contained) | `add-kanban` component |
| **Tree / nested list** | expandable hierarchy, lazy children | ✅ | `.../gallery/tree.tsx` | `add-tree-view` component |
| **Calendar view** | records placed on a month/week grid | ✅ | `.../gallery/calendar.tsx` | `add-calendar` component |
| **Timeline / activity feed** | reverse-chron events, grouped by day | ✅ | `.../gallery/timeline.tsx` | `add-timeline` component |

## B. Record detail / show

| Variant | Demonstrates / options | Status | Files | Skill / component |
| --- | --- | --- | --- | --- |
| **Detail / show** | `getOne` + `DescriptionList`, breadcrumb, edit/delete | ✅ | `products_.$id.tsx` | `add-detail-page` component |
| **Side-panel detail** | detail in a drawer beside the list | ✅ | `orders.$id.tsx` | `add-master-detail` component |
| **Tabbed record** | record-scoped tabs (overview / activity / settings), URL-synced | ✅ | `.../gallery/$id/` nested routes | `add-record-tabs` component |
| **Detail + related lists** | parent record + child tables scoped to its id | ✅ | `.../gallery/detail-related.$id.tsx` | `add-detail-page` component (option) |

## C. Forms & input

| Variant | Demonstrates / options | Status | Files | Skill / component |
| --- | --- | --- | --- | --- |
| **Create/edit dialog** | keyed-remount dialog, zod, server-error mapping | ✅ | `features/products/ProductFormDialog.tsx` | `add-form` component |
| **Full-page form** | same form system on a route, cancel/submit | ✅ | `.../gallery/form-page.tsx` | `add-form` component (option) |
| **Scrollable long form** | `scroll` — sticky header + footer, scrolling body, section anchors | ✅ | `.../gallery/form-scroll.tsx` | `add-form` component (option) |
| **Fixed / compact form** | `fixed` — fits viewport, no scroll, dense | ✅ | `.../gallery/form-fixed.tsx` | `add-form` component (option) |
| **Wizard / stepper** | multi-step, per-step validation, progress, back/next | ✅ | `.../gallery/form-wizard.tsx` | `add-wizard-form` component |
| **Field array (repeatable)** | add/remove repeating row groups | ✅ | `.../gallery/form-array.tsx` | `add-form` component (option) |
| **Custom action buttons** | `custom-actions` — configurable footer/toolbar actions | ✅ | `.../gallery/form-actions.tsx` | `add-form` component (option) |
| **Searchable / async select** | combobox, debounced remote options | ✅ | `components/form/ComboboxField.tsx` + demo | `add-field-combobox` component |
| **Inline / editable cell** | edit-in-place within a table row | ✅ | `.../gallery/table-inline-edit.tsx` | `add-inline-edit` component |
| **Filter / advanced search panel** | a form that drives `ListParams.filters` | ✅ | `.../gallery/filter-panel.tsx` | `add-filter-panel` component |

## D. Pages / layouts

| Variant | Demonstrates / options | Status | Files | Skill / component |
| --- | --- | --- | --- | --- |
| **Dashboard / analytics** | stat cards + charts grid | ✅ | `routes/_app/index.tsx` | `add-chart-page` component |
| **Control / settings page** | grouped controls, toggles, save bar | ✅ | `.../gallery/control-page.tsx` | `add-settings-page` component |
| **Profile / account** | user info + editable sections | ✅ | `.../gallery/profile.tsx` | `add-settings-page` component (option) |
| **Onboarding / empty workspace** | first-run empty state + CTA | ✅ | `.../gallery/empty-state.tsx` | `add-empty-state` component |
| **Split / two-column layout** | content + aside, responsive collapse | ✅ | `.../gallery/split-layout.tsx` | `add-page-layout` component |

## E. Data display (building blocks)

| Block | Status | Files |
| --- | --- | --- |
| Stat cards · Charts (area/bar/pie) · `ChartCard` | ✅ | `components/charts/*` |
| `DescriptionList` · `StatusChip` · `ActionMenu` | ✅ | `infra/ui/*` |
| Tag list · Metadata/key-value panel · Avatar cell · Progress tiles · Stat-with-sparkline | ✅ | `components/data/*` |

## F. Feedback & overlays

| Block | Status | Files |
| --- | --- | --- |
| Toast · Confirm dialog · Command menu (⌘K) | ✅ | `lib/toast`, `ui/confirm-dialog`, `CommandMenu` |
| Drawer / side sheet · Skeleton/empty/error state kit · Inline banners/alerts · Bottom action bar | ✅ | `components/feedback/*` |

## G. Auth & account (behind the auth seam)

| Variant | Status | Files | Skill |
| --- | --- | --- | --- |
| Login / register / forgot / reset | ✅ | `routes/_auth/*` | — |
| Backend preset swap (Supabase / external-API / Postgres) | ✅ | `lib/auth-provider.ts` + `auth-client.ts` | `add-backend-preset` |

## H. System pages

| Variant | Status | Files | Skill |
| --- | --- | --- | --- |
| Error pages 401/403/404/500/503 · maintenance | ✅ (routes exist) | `routes/_app/errors/$code.tsx` | `add-error-pages` (re-list in nav) |

---

## Skills plan

- **One `add-component` catalogue.** The 35+ UI shapes above are components inside
  the single `add-component` skill — each with a reference doc
  (`.claude/skills/add-component/references/<name>.md`) carrying the
  add-it / foundation / invariants / verify steps, plus its template under
  `.claude/skills/add-component/templates/`. The gallery itself is repo-only proof
  and is stripped from the scaffold base by `build-base` (no per-shape `remove-*`
  skill).
- **Standalone operation skills** stay their own directories: `scaffold-dashboard`,
  `add-crud-resource`, `add-data-source`, `add-backend-preset`, `rebrand`,
  `add-tests`.
- **Options as composable docs**: pagination / infinite / lazy / searchable /
  filterable / selectable / custom-actions / scroll-vs-fixed are documented once
  in `add-component` and referenced by each component, not re-explained per variant.

## Stripped from the scaffold base

The gallery is repo-only proof: it ships in this substrate so every shape is
verified and visible, but it is **not** part of the product base. `build-base`
strips it when assembling the `scaffold-dashboard` bundle — it drops the
`gallery/*` routes, the `SHAPES` array in `gallery/index.tsx`, and the
`Skills Gallery` + all `Skills · …` sidebar groups. A scaffolded product therefore
starts gallery-free and **composes** the shapes it needs from `add-component`. To
explore the shapes live, `git clone` the full repo and run `bun dev`, then build
your product in a fresh scaffold.

## Suggested build order (each phase ends zero-config-green + signed off)

1. **Forms** (most variants, sets the option-toggle conventions): full-page,
   scroll, fixed, wizard, field-array, custom-actions, combobox.
2. **Lists** (most-used): list-lite, infinite, lazy, virtual table, inline-edit.
3. **Pages**: control/settings, profile, empty-state, split-layout.
4. **Rich lists**: kanban, tree, calendar, timeline.
5. **Display + feedback blocks**: drawer, state-kit, tag/metadata/avatar, banners.

---

## Decisions taken

- **Scope**: build everything, including the heavy views (kanban / tree / calendar
  / timeline). Done.
- **Sidebar**: the **Skills Gallery** — a `Skills Gallery · Overview` entry (the
  tabbed catalogue, `gallery/index.tsx` / the `SHAPES` array) plus one entry per
  skill under the `Skills · …` groups.
- **Routes**: all gallery demos nested under `src/routes/_app/gallery/*` (+ a few
  components under `src/components/{data,feedback}` and `ComboboxField.tsx`), so the
  whole gallery strips as a unit from the scaffold base via `build-base`.
- **Skills**: every shape is a component in the single `add-component` skill (see
  `.claude/skills/add-component/` — one `references/<name>.md` + template per
  shape); the gallery is stripped from the scaffold base by `build-base`. Structure
  documented in `CLAUDE.md`.
