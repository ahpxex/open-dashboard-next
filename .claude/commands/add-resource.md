---
description: Scaffold a new CRUD resource (table + server + queries + table page + form)
argument-hint: <plural-resource-name> [field notes]
---

Use the **add-crud-resource** skill to scaffold a new CRUD resource.

Resource (and any field hints): $ARGUMENTS

Run `bun run create-resource <name>`, then customise the Drizzle table and the
zod schemas to the requested fields, adjust columns/filters/repository config,
run `bun run db:generate && bun run db:migrate`, and verify with
`bun run typecheck && bun run check && bun run test`. Follow every invariant in
the skill (requireUser, URL state, toast, confirm). If the user wants a detail
page, card view, or master-detail panel, also apply the corresponding skill.
