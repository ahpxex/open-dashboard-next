---
description: Port this template into a new product (rebrand → strip demo → pick data source → add resources)
argument-hint: <product brief>
---

Port this admin template into a new product per `PORTING.md`.

Product brief: $ARGUMENTS

Work in order, using the matching skills and verifying (`typecheck`/`check`/
`test`) after each step:

1. **rebrand** — set name/logo/description/theme in `src/config/app.ts`.
2. **strip-demo** — remove the products/orders/posts demo + sample dashboard,
   leaving a clean branded shell.
3. **Pick the data source** for each entity (Drizzle / REST / GraphQL) via
   **add-data-source**.
4. **Add the resources and page shapes** the brief needs via
   **add-crud-resource**, **add-detail-page**, **add-card-list**,
   **add-master-detail**, **add-chart-page**.

Confirm the plan with the user before deleting the demo or running migrations.
