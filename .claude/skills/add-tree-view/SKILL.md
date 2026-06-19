---
name: add-tree-view
description: Add an expandable tree / nested list — hierarchical rows with expand/collapse and indentation. Use for folders, org charts, categories, or any parent/child hierarchy.
---

# Add a tree view

**Canonical example**: `src/routes/_app/gallery/tree.tsx` — a nested data
structure (~3 levels), expand/collapse tracked in a `Set` of ids, depth-based
indentation, folder/file icons with a rotating caret, leaf click toasts its path.

## Add one

1. Copy the canonical file; replace the nested data shape.
2. For large/remote trees, lazy-load children on first expand (see `add-list-view`'s
   lazy pattern) instead of holding the whole tree in memory.
3. Add a sidebar entry.

## Invariants

- Expansion state is a `Set<id>`; render is a recursive node component keyed by id.
- Indent by depth; the caret reflects expanded state.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — expand/collapse and leaf
selection work at every level.
