---
name: add-page-layout
description: Add a multi-column page layout — e.g. a main content column plus a right aside (summary/metadata), responsive down to one column. Use when a page needs primary content beside contextual side content. Ships a copy-ready template.
---

# Add a page layout

A two-column layout — main content beside a fixed-width right aside — that
collapses to one column on small screens via
`grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6`. The page is **bundled** under
`templates/` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-page-layout/templates/split-layout.tsx src/routes/_app/<name>.tsx
```

Then in the copied file:
1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Put your primary content in the main column and contextual content (summary,
   metadata, actions) in the `<aside>`; keep the aside non-essential so the page
   still makes sense when it stacks below on mobile.
3. Real use: compose existing blocks (`Card`, `DescriptionList`, data-display)
   inside, fed from your loaded record. Add a sidebar entry, or reach it from a
   detail page.

(Only open the template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/ui/{badge,button,card,separator}`, `@/infra/ui`
(`DescriptionList`, `StatusChip`), `@tanstack/react-router`,
`@phosphor-icons/react`, the page-shell heading, and theme tokens — all provided by
the base (see the `scaffold-dashboard` skill).

## Invariants

- Responsive by default (collapses to one column); the aside is supplementary.
- Use the page-shell heading convention; compose existing blocks
  (`Card`, `DescriptionList`, data-display) inside.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — resize: two columns on
desktop, stacked on mobile.
