---
name: add-tests
description: Add a Vitest test scaffold for a resource — exercise its data layer (list search/filter/sort/pagination + create/update/remove) against the in-memory adapter, and its zod input validator. Use to lock in a resource's behaviour without a database. Ships a copy-ready exemplar.
---

# Add resource tests

A resource is worth two cheap, fast tests: its **data layer** (the list params +
mutations, run against `memoryRepository` so no database is needed) and its
**input validator** (the zod schema behind `createServerFn(...).validator`). The
full exemplar is **bundled** at `templates/resource.test.ts` — you copy it, you
don't paste code from here.

## Add one

```bash
cp .claude/skills/add-tests/templates/resource.test.ts src/features/<name>/<name>.test.ts
```

Then in the copied file:
1. Replace the in-file `Widget` fixture type + `seed` with your resource's row
   shape (or import your real `demo-data.ts` seed), and set the `memoryRepository`
   config (`searchFields` / `sortFields` / `filterFields` / `defaultSort`) to
   match your resource's `server.ts` binding.
2. Replace `widgetInputSchema` with `import { <name>InputSchema } from "./schema"`
   and assert it accepts good input and rejects each bad case (missing required
   field, out-of-range value, value outside an enum).
3. Keep one test per behaviour — pagination + total, case-insensitive search,
   equality filter, whitelisted sort (asc/desc), a non-whitelisted sort falling
   back to the default, and create/update/remove.

(Only open the template if you need to customise it — copying it costs no context.)

## What to test

- **List params** — that `{ page, pageSize, search, sortBy, sortDir, filters }`
  produce the rows + `total` you expect. The adapter is shared, so this proves
  your resource maps its params correctly (e.g. a flat `status` → `filters`).
- **Sort whitelist** — a field NOT in `sortFields` must fall back to the default
  sort (never sort by raw user input).
- **Mutations** — `create` assigns an id/timestamps and is listable; `update`
  merges fields; `remove` deletes.
- **Validator** — the input schema accepts valid input (and coerces numeric
  strings that arrive over the wire) and rejects each invalid shape.

## Foundation it assumes

`@/infra/data/memory-repository` (the zero-config adapter) and `zod` — both in
the base. Tests run under **Vitest**; co-locate them as `*.test.ts(x)` next to
the code.

## Verify

`bun run test` — the file is picked up automatically and must pass.
