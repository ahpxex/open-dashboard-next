---
name: add-saved-views
description: Add named filter/sort presets ("saved views") to a list — save the current {search, filters, sort} under a name and re-apply or delete it later, persisted to localStorage. Use when users repeat the same filter/sort combinations. Ships a copy-ready template.
---

# Add saved views

A "Views" dropdown lists named presets; "Save current view…" prompts a name and
snapshots the page's `{ search, filters, sort }` to `localStorage`; picking a
view re-applies it, and each row has a delete control. The control is **bundled**
at `templates/SavedViews.tsx` and a wired page at `templates/saved-views.tsx` —
copy, don't paste.

## Add one

```bash
cp .claude/skills/add-saved-views/templates/SavedViews.tsx src/infra/table/SavedViews.tsx
cp .claude/skills/add-saved-views/templates/saved-views.tsx src/routes/_app/<name>.tsx
```

1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. The page owns `{ search, filters, sort }`; build a `current: ViewState` from
   it and write an `onApply(state)` that pushes each field back into state.
3. Give `SavedViews` a per-resource `storageKey` (e.g. `saved-views:products`)
   so views don't collide across pages.
4. On a real resource, list/sort/filter state belongs in the URL
   (`useTableSearch`); have `onApply` navigate to the saved `ViewState` instead
   of `setState`, and derive `current` from the URL search.

(Only open the template if you need to customise it — copying costs no context.)

## Foundation it assumes

`@/components/ui/{dropdown-menu,button,input,label,select,table,card,badge}`,
`@phosphor-icons/react`, the page-shell heading, and theme tokens.

## Invariants

- localStorage access is SSR-guarded (`typeof window`); views hydrate in a
  `useEffect` after mount so the server and first client render agree.
- A view is a **snapshot** — clone the state on save and on apply so later page
  changes don't mutate a stored view.
- Namespace `storageKey` per resource; persisting writes through the same key it
  reads.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — set a filter + sort,
save a view, change the filters, then re-pick the view (filters/sort restore).
Reload the page and confirm the saved view survives.
