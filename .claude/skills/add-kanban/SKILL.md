---
name: add-kanban
description: Add a kanban board — records grouped into status columns with drag-and-drop between them. Use for triage/pipeline views (tasks, deals, tickets) where status is the primary axis. Ships a copy-ready template.
---

# Add a kanban board

A board is a list grouped by a status field, with drag-to-change-status. The full
component is **bundled** at `templates/kanban.tsx` — you don't paste code from here.

## Add one

```bash
cp .claude/skills/add-kanban/templates/kanban.tsx src/routes/_app/<name>.tsx
```

Then in the copied file:
1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Set `COLUMNS` to your status enum and the card/`KanbanCard` shape.
3. Real resource: group a `Repository` list by status into the board, and in
   `handleDrop` call `update(cardId, { status: to })` optimistically (toast/roll back
   on error) instead of only mutating local state.

(Only open the template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/ui/{card,badge}`, `@/lib/toast`, `@/lib/utils` (`cn`),
`@phosphor-icons/react`, the page-shell heading, and theme tokens — all provided by
the base (see the `scaffold-dashboard` skill).

## Invariants

- One status enum drives the columns; a card's column IS its status; moving a card
  persists the new status. Native HTML5 DnD only. Theme tokens only.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — drag a card between
columns and confirm it sticks.
