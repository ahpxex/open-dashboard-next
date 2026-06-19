# Gallery catalogue

> The **gallery of admin UI shapes**: a rich palette an agent picks from and
> **trims on port** (`trim-gallery`). All variants below are **built, green
> (typecheck/check/test/build), and zero-config runnable** — each is a
> self-contained route under `src/routes/_app/gallery/`, grouped in the sidebar
> under `Gallery · …`, with an `add-*` skill in `.claude/skills/`.

Legend: ✅ built & verified · `skill` = the skill that adds/edits it.

---

## The 3 hard rules (every variant must obey these, or the gallery hurts the agent)

1. **Same conventions as everything else.** `ListParams` shape, `Repository` +
   `AuthProvider` seams, query keys `["<res>","list",params]`, URL-synced state,
   explicit loading / empty / error. Consistency beats count (ROADMAP #2).
2. **Self-contained + independently removable.** One route (+ one `features/<name>/`
   folder if it has data). Deleting it touches nothing else — this is what lets the
   agent **trim on port**.
3. **Every variant has a skill** (`add-*` / `modify-*` / `remove-*`) and a catalogue
   row. If an agent can't add it from a skill, it isn't done (ROADMAP #6).

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

| Variant | Demonstrates / options | Status | Files | Skill |
| --- | --- | --- | --- | --- |
| **Data table** | server paginate/sort/search/filter, CRUD, bulk select | ✅ | `features/products`, `routes/_app/products.tsx` | `add-crud-resource` |
| **Card / grid gallery** | responsive card grid, same plumbing as table | ✅ | `features/posts` + `posts.tsx` | `add-card-list` |
| **Master-detail split** | list stays mounted + side panel (selection in URL) | ✅ | `orders.tsx` + `orders.$id.tsx` | `add-master-detail` |
| **List view (lite/dense)** | compact rows, leading icon/avatar, secondary text, no table chrome | ✅ | `routes/_app/gallery/list-lite.tsx` | `add-list-view` |
| **Infinite / load-more list** | `infinite` option, cursor/offset, no pager | ✅ | `.../gallery/list-infinite.tsx` | `add-infinite-list` |
| **Lazy list** | `lazy` — defer fetch until visible/expanded | ✅ | `.../gallery/list-lazy.tsx` | `add-list-view` (option) |
| **Virtualized table** | windowed rows for large datasets (10k+) | ✅ | `.../gallery/table-virtual.tsx` | `add-virtual-table` |
| **Kanban board** | columns + drag between, status = column | ✅ | `features/tasks` + `.../gallery/kanban.tsx` | `add-kanban` |
| **Tree / nested list** | expandable hierarchy, lazy children | ✅ | `.../gallery/tree.tsx` | `add-tree-view` |
| **Calendar view** | records placed on a month/week grid | ✅ | `.../gallery/calendar.tsx` | `add-calendar` |
| **Timeline / activity feed** | reverse-chron events, grouped by day | ✅ | `.../gallery/timeline.tsx` | `add-timeline` |

## B. Record detail / show

| Variant | Demonstrates / options | Status | Files | Skill |
| --- | --- | --- | --- | --- |
| **Detail / show** | `getOne` + `DescriptionList`, breadcrumb, edit/delete | ✅ | `products_.$id.tsx` | `add-detail-page` |
| **Side-panel detail** | detail in a drawer beside the list | ✅ | `orders.$id.tsx` | `add-master-detail` |
| **Tabbed record** | record-scoped tabs (overview / activity / settings), URL-synced | ✅ | `.../gallery/$id/` nested routes | `add-record-tabs` |
| **Detail + related lists** | parent record + child tables scoped to its id | ✅ | `.../gallery/detail-related.$id.tsx` | `add-detail-page` (option) |

## C. Forms & input

| Variant | Demonstrates / options | Status | Files | Skill |
| --- | --- | --- | --- | --- |
| **Create/edit dialog** | keyed-remount dialog, zod, server-error mapping | ✅ | `features/products/ProductFormDialog.tsx` | `add-form` |
| **Full-page form** | same form system on a route, cancel/submit | ✅ | `.../gallery/form-page.tsx` | `add-form` (option) |
| **Scrollable long form** | `scroll` — sticky header + footer, scrolling body, section anchors | ✅ | `.../gallery/form-scroll.tsx` | `add-form` (option) |
| **Fixed / compact form** | `fixed` — fits viewport, no scroll, dense | ✅ | `.../gallery/form-fixed.tsx` | `add-form` (option) |
| **Wizard / stepper** | multi-step, per-step validation, progress, back/next | ✅ | `.../gallery/form-wizard.tsx` | `add-wizard-form` |
| **Field array (repeatable)** | add/remove repeating row groups | ✅ | `.../gallery/form-array.tsx` | `add-form` (option) |
| **Custom action buttons** | `custom-actions` — configurable footer/toolbar actions | ✅ | `.../gallery/form-actions.tsx` | `add-form` (option) |
| **Searchable / async select** | combobox, debounced remote options | ✅ | `components/form/ComboboxField.tsx` + demo | `add-field-combobox` |
| **Inline / editable cell** | edit-in-place within a table row | ✅ | `.../gallery/table-inline-edit.tsx` | `add-inline-edit` |
| **Filter / advanced search panel** | a form that drives `ListParams.filters` | ✅ | `.../gallery/filter-panel.tsx` | `add-filter-panel` |

## D. Pages / layouts

| Variant | Demonstrates / options | Status | Files | Skill |
| --- | --- | --- | --- | --- |
| **Dashboard / analytics** | stat cards + charts grid | ✅ | `routes/_app/index.tsx` | `add-chart-page` |
| **Control / settings page** | grouped controls, toggles, save bar | ✅ | `.../gallery/control-page.tsx` | `add-settings-page` |
| **Profile / account** | user info + editable sections | ✅ | `.../gallery/profile.tsx` | `add-settings-page` (option) |
| **Onboarding / empty workspace** | first-run empty state + CTA | ✅ | `.../gallery/empty-state.tsx` | `add-empty-state` |
| **Split / two-column layout** | content + aside, responsive collapse | ✅ | `.../gallery/split-layout.tsx` | `add-page-layout` |

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

- **Per archetype**: `add-*` (scaffold the variant), `modify-*` (toggle the
  cross-cutting options above), `remove-*` (delete the self-contained variant).
- **Reuse what exists**: `add-crud-resource`, `add-detail-page`, `add-card-list`,
  `add-master-detail`, `add-form`, `add-chart-page`, `add-data-source`,
  `add-backend-preset`, `rebrand`, `strip-demo`.
- **Options as composable docs**: pagination / infinite / lazy / searchable /
  filterable / selectable / custom-actions / scroll-vs-fixed are documented once
  and referenced by each skill, not re-explained per variant.

## Trim on port

Because every variant is self-contained, extend `strip-demo` / `/port` into a
**`trim-gallery`** step: the agent keeps the categories/variants the brief needs
and deletes the rest (route + feature folder + sidebar entry + catalogue row),
leaving a focused app. One `remove-*` skill per archetype backs this.

## Suggested build order (each phase ends zero-config-green + signed off)

1. **Forms** (most variants, sets the option-toggle conventions): full-page,
   scroll, fixed, wizard, field-array, custom-actions, combobox.
2. **Lists** (most-used): list-lite, infinite, lazy, virtual table, inline-edit.
3. **Pages**: control/settings, profile, empty-state, split-layout.
4. **Rich lists**: kanban, tree, calendar, timeline.
5. **Display + feedback blocks**: drawer, state-kit, tag/metadata/avatar, banners.
6. **Trim**: `trim-gallery` skill + per-archetype `remove-*` + catalogue wired to nav.

---

## Decisions taken

- **Scope**: build everything, including the heavy views (kanban / tree / calendar
  / timeline). Done.
- **Sidebar**: grouped under labelled `Gallery · …` sections.
- **Routes**: all gallery demos nested under `src/routes/_app/gallery/*` (+ a few
  components under `src/components/{data,feedback}` and `ComboboxField.tsx`), so the
  whole gallery trims as a unit via `trim-gallery`.
- **Skills**: one `add-*` skill per shape (see `.claude/skills/`), plus
  `trim-gallery` for removal. Structure documented in `CLAUDE.md`.
