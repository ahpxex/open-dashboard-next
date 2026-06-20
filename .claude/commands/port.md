---
description: Port this template into a new product (scaffold clean base → rebrand → pick backend → add resources & shapes)
argument-hint: <product brief>
---

Port this admin template into a new product per `PORTING.md`.

Product brief: $ARGUMENTS

Work in order, using the matching skills and verifying (`typecheck`/`check`/
`test`) after each step:

1. **scaffold-dashboard** — stand up the clean platform base in a **new** project.
   It ships demo-free + gallery-free and runs zero-config, so you *add* what the
   brief needs rather than stripping a demo.
2. **rebrand** — set name/logo/description/theme in `src/config/app.ts`.
3. **Pick the data source** for each entity (Drizzle / REST / GraphQL) via
   **add-backend-preset** / **add-data-source**.
4. **Add the resources and page shapes** the brief needs via **add-crud-resource**
   and the **add-component** catalogue (detail, master-detail, card-list,
   chart-page, kanban, …).

Confirm the plan with the user before running migrations.
