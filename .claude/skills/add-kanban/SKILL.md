---
name: add-kanban
description: Add a kanban board — records grouped into status columns with drag-and-drop between them. Use for triage/pipeline views (tasks, deals, tickets) where status is the primary axis.
---

# Add a kanban board

A board is a list grouped by a status field, with drag-to-change-status.

**Canonical example**: `src/routes/_app/gallery/kanban.tsx` — three status columns,
cards with title + tag, native HTML5 drag-and-drop (drag-over highlight), moves
update local state and toast. Deterministic cards.

## Add one

1. Copy the canonical file; set your columns (the status enum) + card shape.
2. For a real resource: on drop, call the resource's `update(id, { status })`
   mutation (optimistic), and group rows by status from a `Repository` list.
3. Add a sidebar entry.

## Invariants

- Columns are the status enum; a card's column IS its status.
- Moving a card persists the new status (mutation) for real resources; gallery
  demo keeps it in local state.
- Keep drag handlers self-contained (native DnD, no extra library).

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — drag a card between
columns and confirm it sticks.
