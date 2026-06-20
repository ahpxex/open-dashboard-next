---
name: add-table-columns
description: Add column visibility + row density controls to a table — a "Columns" popover that toggles which columns show (TanStack `columnVisibility`) and switches comfortable/compact density. Use when a table has many columns or users want to declutter it. Ships a copy-ready template.
---

# Add column controls & density

A "Columns" popover with a checkbox per hideable column (driven by TanStack
Table `columnVisibility` state) plus a comfortable/compact density toggle. The
control is **bundled** at `templates/ColumnControls.tsx` and a wired page at
`templates/table-columns.tsx` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-table-columns/templates/ColumnControls.tsx src/infra/table/ColumnControls.tsx
cp .claude/skills/add-table-columns/templates/table-columns.tsx src/routes/_app/<name>.tsx
```

1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Give each `ColumnDef` a `meta: { label }` (the popover's checkbox label) and
   set `enableHiding: false` on any column that must always show.
3. In the page, own `columnVisibility` (a `VisibilityState`) and `density` in
   state, pass them into `useReactTable({ state, onColumnVisibilityChange })`,
   and render `<ColumnControls table density onDensityChange />`. Map density to
   cell padding.
4. To use this on the generic server-driven `DataTable` (the `features/<name>`
   pages) instead of the bundled standalone demo: own `columnVisibility`
   (a `VisibilityState`) in the page and pass it down — `DataTable` accepts
   `columnVisibility` + `onColumnVisibilityChange` props and merges them into its
   own `useReactTable`. Render `ColumnControls` in the page's `toolbarActions`,
   handing it a `table` instance whose columns mirror your `ColumnDef`s.

(Only open the template if you need to customise it — copying costs no context.)

## Foundation it assumes

`@tanstack/react-table` (`useReactTable`, `VisibilityState`, `flexRender`),
`@/components/ui/{popover,checkbox,button,label,table,card,badge}`, `@/lib/utils`
(`cn`), `@phosphor-icons/react`, the page-shell heading, and theme tokens.

## Invariants

- Visibility lives in the table instance (`columnVisibility` state); density is
  the parent's. Both are controlled — no internal copies.
- A column opts out of hiding with `enableHiding: false` (don't let users hide
  the row's identity column).
- `ColumnControls` reads `column.columnDef.meta.label` for the toggle name (the
  bundled component augments TanStack's `ColumnMeta` to type it).

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — open the Columns
popover, toggle a column off/on (the table reflows), and flip density
(comfortable ↔ compact) to confirm row padding changes.
