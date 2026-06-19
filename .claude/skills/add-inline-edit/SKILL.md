---
name: add-inline-edit
description: Add inline / editable table cells — click a cell to edit it in place (input or select), commit on blur/Enter, revert on Escape. Use for quick spreadsheet-style edits without a separate form.
---

# Add inline-editable cells

**Canonical example**: `src/routes/_app/gallery/table-inline-edit.tsx` — a table
whose cells swap to an `Input`/`Select` on click; commit on blur/Enter, revert on
Escape; one cell editable at a time; commits update local state and toast.

## Add one

1. Copy the canonical file; map your columns to editable controls.
2. For a real resource, commit a cell by calling `update(id, { [field]: value })`
   (optimistic) and toast/rollback on error.
3. Add a sidebar entry.

## Invariants

- One cell edits at a time; Enter/blur commit, Escape reverts.
- Editable columns are explicit (don't make every cell editable by accident).
- Real edits persist via a `Repository` mutation; validate the value first.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — edit a cell, commit and
revert both behave.
