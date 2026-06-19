---
name: add-tree-view
description: Add an expandable tree / nested list — hierarchical rows with expand/collapse and indentation. Use for folders, org charts, categories, or any parent/child hierarchy. Ships a copy-ready template.
---

# Add a tree view

An expandable tree of nested rows — expand/collapse tracked in a `Set` of ids,
depth-based indentation, folder/file icons with a rotating caret. The page is
**bundled** under `templates/` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-tree-view/templates/tree.tsx src/routes/_app/<name>.tsx
```

Then in the copied file:
1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Replace the `TREE` nested data shape (and `INITIAL_EXPANDED`) with your hierarchy.
3. Real resource: for large/remote trees, lazy-load each node's children on first
   expand (see `add-list-view`'s lazy pattern) instead of holding the whole tree in
   memory; have a leaf click route to its detail instead of toasting its path.

(Only open the template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/lib/toast`, `@/lib/utils` (`cn`), `@phosphor-icons/react`
(`CaretRight`/`Folder`/`FolderOpen`/`File`), the page-shell heading, and theme
tokens (`border`/`card`/`muted`/`foreground`/`primary`) — all provided by the base.

## Invariants

- Expansion state is a `Set<id>`; render is a recursive node component keyed by id.
- Indent by depth; the caret reflects expanded state.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — expand/collapse and leaf
selection work at every level.
