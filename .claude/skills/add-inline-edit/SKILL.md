---
name: add-inline-edit
description: Add inline / editable table cells — click a cell to edit it in place (input or select), commit on blur/Enter, revert on Escape. Use for quick spreadsheet-style edits without a separate form. Ships a copy-ready template.
---

# Add inline-editable cells

Click a cell to swap its static value for an `Input`/`Select`; commit on blur/Enter,
revert on Escape; one cell editable at a time. The full page is **bundled** at
`templates/table-inline-edit.tsx` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-inline-edit/templates/table-inline-edit.tsx src/routes/_app/<name>.tsx
```

1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Map your columns to editable controls — text → `Input`, enum → `Select` — and
   update the `EditingCell` field union + `INITIAL_ROWS` for your shape.
3. Real resource: in `commit`, call `update(id, { [field]: value })` (optimistic)
   and toast/rollback on error instead of only mutating local state. Validate the
   value first.

(Only open the template if you need to customise it — copying costs no context.)

## Foundation it assumes

`@/components/ui/{input,select,table,badge,card}`, `@/lib/toast` (`toast`),
`@/lib/utils` (`cn`), the page-shell heading (`font-heading text-2xl …` + muted
`<p>`), and theme tokens (`bg-muted/60`, `text-muted-foreground`).

## Invariants

- One cell edits at a time; Enter/blur commit, Escape reverts.
- Editable columns are explicit (don't make every cell editable by accident).
- Real edits persist via a `Repository` mutation; validate the value first, and
  report each commit with a toast.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — edit a cell; commit
(Enter/blur) and revert (Escape) both behave, and only one cell edits at a time.
