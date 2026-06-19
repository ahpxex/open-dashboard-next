---
name: add-data-display
description: Add data-display building blocks — tag list, key/value metadata panel, user (avatar+name) cell, and metric/progress tiles. Use to present record fields and small metrics consistently. Ships a copy-ready template.
---

# Add data-display blocks

Small, reusable presentational components for showing fields and metrics — a
`TagList` (wrapping `Badge` row), a `MetadataList` (compact key/value `<dl>` grid,
value is any `ReactNode`), a `ProgressTile` (metric tile with a `Progress` bar +
`value/total` + percent), and a `UserCell` (initials `Avatar` + name over muted
email). The components and a showcase page are **bundled** under `templates/` —
copy, don't paste.

## Add one

```bash
cp .claude/skills/add-data-display/templates/TagList.tsx src/components/data/TagList.tsx
cp .claude/skills/add-data-display/templates/MetadataList.tsx src/components/data/MetadataList.tsx
cp .claude/skills/add-data-display/templates/ProgressTile.tsx src/components/data/ProgressTile.tsx
cp .claude/skills/add-data-display/templates/UserCell.tsx src/components/data/UserCell.tsx
# Optional: a gallery page showcasing all four
cp .claude/skills/add-data-display/templates/data-display.tsx src/routes/_app/<name>.tsx
```

Then:
1. Reuse the components from `@/components/data/*` directly in any page or table
   cell — they take fully-formed props.
2. If you copied the showcase page, set its `createFileRoute("/_app/<name>")` path
   to match the file path.
3. To add a new block, drop a presentational component in `src/components/data/`
   and (optionally) showcase it in the gallery page.

(Only open a template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/ui/{avatar,badge,card,progress}`, and (for the showcase page)
`@tanstack/react-router`, the page-shell heading, and theme tokens — all provided
by the base (see the `scaffold-dashboard` skill).

## Invariants

- Presentational only — no data fetching; take fully-formed props.
- Themed via tokens (`Badge`, `Progress`, `Avatar`); no hardcoded colours.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — the blocks render with
sample data.
