---
name: add-data-display
description: Add data-display building blocks — tag list, key/value metadata panel, user (avatar+name) cell, and metric/progress tiles. Use to present record fields and small metrics consistently.
---

# Add data-display blocks

Small, reusable presentational components for showing fields and metrics.

**Canonical example**: `src/routes/_app/gallery/data-display.tsx` showcases them;
the components live in `src/components/data/`:
- `TagList` — wrapping `Badge` row.
- `MetadataList` — compact key/value `<dl>` grid (value is any `ReactNode`).
- `ProgressTile` — metric tile with a `Progress` bar + `value/total` + percent.
- `UserCell` — initials `Avatar` + name over muted email.

## Add one

1. Reuse the components from `@/components/data/*` directly in any page/table cell.
2. To add a new block, drop a component in `src/components/data/` and showcase it
   in the gallery page.

## Invariants

- Presentational only — no data fetching; take fully-formed props.
- Themed via tokens (`Badge`, `Progress`, `Avatar`); no hardcoded colours.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — the blocks render with
sample data.
