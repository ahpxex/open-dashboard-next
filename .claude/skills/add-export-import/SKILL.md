---
name: add-export-import
description: Add CSV export + import to a list — download rows as an RFC 4180 CSV, and import a CSV file into a parsed preview (ready to hand to a bulk-create). Use when users need to get data out of, or bulk-load data into, a resource. Ships a copy-ready template.
---

# Add CSV export & import

An "Export CSV" button serializes rows with `toCsv` and downloads them via
`downloadCsv`; an "Import CSV" dialog reads a file, runs `parseCsv`, and previews
the rows. The util is **bundled** at `templates/csv.ts` and the page at
`templates/export-import.tsx` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-export-import/templates/csv.ts src/infra/data/csv.ts
cp .claude/skills/add-export-import/templates/export-import.tsx src/routes/_app/<name>.tsx
```

1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Set `EXPORT_COLUMNS` (header + accessor per column) and the row shape to your
   resource; usually mirror your `columns.tsx`.
3. Real export: build the rows from a `Repository` list (a server fn returning
   all matching rows) instead of the local array, then `downloadCsv`.
4. Real import: validate each `parseCsv(...).rows` entry with the resource's Zod
   schema, then pass the valid rows to a bulk-create server fn (`requireUser()`
   first); report counts with a toast.

(Only open the template if you need to customise it — copying costs no context.)

## Foundation it assumes

`@/infra/data/csv` (`toCsv`, `downloadCsv`, `parseCsv`, `CsvColumn`,
`ParsedCsv`), `@/components/ui/{button,card,dialog,table,badge}`, `@/lib/toast`
(`toast`), `@phosphor-icons/react`, the page-shell heading, and theme tokens.

## Invariants

- `toCsv` quotes per RFC 4180 (comma/quote/CR/LF wrap in quotes, `"` doubled);
  don't hand-roll string concatenation.
- `downloadCsv` is browser-only (guards `document`); never call it server-side.
- `parseCsv` is pure — safe on the server.
- Import previews only until you persist: validate rows, then a bulk-create
  server fn (`requireUser()` first). Report success/failure with a toast.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — click Export and
confirm the CSV downloads; open Import, choose that CSV, and confirm the parsed
rows preview correctly (quoted fields and commas survive the round-trip).
