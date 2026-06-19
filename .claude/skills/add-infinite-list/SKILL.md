---
name: add-infinite-list
description: Add an infinite / load-more list — items load in pages via a "Load more" button and/or scroll-near-bottom, instead of numbered pagination. Use for feeds and long collections where a pager is awkward. Ships a copy-ready template.
---

# Add an infinite / load-more list

Grow a visible window instead of paging — the right shape for feeds and long
collections where a numbered pager is awkward. The full page is **bundled** at
`templates/list-infinite.tsx` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-infinite-list/templates/list-infinite.tsx src/routes/_app/<name>.tsx
```

1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Swap the row shape + sample data (`ITEMS`, `TOTAL`, `PAGE`) for yours.
3. Real resource: back it with a `Repository` that pages by cursor/offset — request
   the next page on "load more", append to the accumulated list, keep the cursor in
   state. Keep filters/search in the URL.

(Only open the template if you need to customise it — copying costs no context.)

## Foundation it assumes

`@/components/ui/{avatar,badge,button}`, `@phosphor-icons/react` (`SpinnerIcon`),
the page-shell heading (`font-heading text-2xl …` + muted `<p>`), and theme tokens
(`border-border`, `divide-border`, `text-muted-foreground`, `bg-muted/50`).

## Invariants

- The "Load more" button must always work (the scroll-near-bottom trigger is an
  enhancement, not the only path).
- Show how many are loaded vs total ("Showing X of N"), and a clear end-of-list state.
- Remote variant: handle loading (next-page spinner) and error (retry) explicitly.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — "Load more" grows the
list, scrolling near the bottom also pages, and it stops cleanly at the end.
