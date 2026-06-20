---
name: add-global-search
description: Add a ⌘K-style global search across resources — a cmdk dialog/command that takes SearchSources (label + items + toResult, or a custom search(query)), groups hits by resource, is keyboard-navigable, and navigates to a result's href on select. Use for cross-resource jump-to. Ships a copy-ready component + demo.
---

# Add global search

A search across multiple resources from one box. `GlobalSearch` takes a list of
`SearchSource`s — each a `{ label, items, toResult }` (the component filters
items by the result's title/subtitle and groups them under `label`) or a custom
`{ label, search(query) }`. It's keyboard-navigable (cmdk), groups by source, and
navigates to the selected result's `href`. The component and a gallery demo are
**bundled** under `templates/` — copy, don't paste.

## Add it

```bash
cp .claude/skills/add-global-search/templates/GlobalSearch.tsx src/components/GlobalSearch.tsx
# Optional: an always-open demo over mock resources
cp .claude/skills/add-global-search/templates/global-search.tsx src/routes/_app/gallery/global-search.tsx
```

Then:
1. **Wire real sources.** Map each resource's list rows to results:

   ```tsx
   const sources: SearchSource[] = [
     {
       label: "Customers",
       items: customers,                 // from your list query
       toResult: (c) => ({
         id: c.id,
         title: c.name,
         subtitle: c.email,
         href: `/customers/${c.id}`,
       }),
     },
   ];
   ```

   For server-side search, pass `search: (q) => myServerResults` instead of
   `items`/`toResult` (debounce + fetch in the parent, feed the rows in).
2. **Open it from ⌘K / the header.** Hold `open` state (a `useState` or the
   existing `useCommandMenu` Zustand store), add a ⌘K key listener, and render
   `<GlobalSearch sources={sources} open={open} onOpenChange={setOpen} />`. Pass
   `inline` to embed it without the dialog chrome (the demo does this).

(Only open a template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`cmdk`, `@tanstack/react-router` (`useNavigate`), `@/components/ui/kbd`,
`@phosphor-icons/react` — all in the base. Mirrors the existing `CommandMenu`
plumbing, so it composes with it.

## Invariants

- `shouldFilter={false}` — the component filters itself so groups + subtitles
  match; don't re-enable cmdk's built-in filter.
- Each source owns its `href`; selecting a result navigates there and closes.
- Presentational + navigational only — sources fetch their own data upstream.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — type a query and
confirm grouped results filter live and selecting one navigates.
