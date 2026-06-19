---
name: add-virtual-table
description: Add a virtualized / windowed table that stays smooth with thousands of rows by rendering only the visible slice. Use when a list/table can hold 1000s of rows client-side. Ships a copy-ready template.
---

# Add a virtualized table

When a dataset is large enough that rendering every row janks, window it: render
only the rows in (and just around) the viewport, with spacers for the rest. The
full page — hand-rolled windowing, no extra dependency — is **bundled** at
`templates/table-virtual.tsx` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-virtual-table/templates/table-virtual.tsx src/routes/_app/<name>.tsx
```

1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Set the row shape (`Row`), `ROW_HEIGHT`, and the column set; swap the sample
   `ROWS` for yours.
3. Real resource: feed it your rows — fetch one large page from a `Repository` (or
   stream) into the array.

(Only open the template if you need to customise it — copying costs no context.)

## Foundation it assumes

`@/components/ui/table` (`Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/
`TableCell`), the page-shell heading (`font-heading text-2xl …` + muted `<p>`), and
theme tokens (`border-border`, `bg-card`, `text-muted-foreground`).

## Invariants

- Row height is fixed (`ROW_HEIGHT` — the windowing math depends on it); keep a
  small `OVERSCAN`.
- Top/bottom spacer rows preserve total scroll height; the header stays sticky.
- Show total + visible counts. No new dependency — the windowing is self-contained.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — scrolling stays smooth
and rows render correctly at the top, middle, and bottom.
