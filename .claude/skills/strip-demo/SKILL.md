---
name: strip-demo
description: Remove the demo resources (products, orders, posts) and the sample dashboard, leaving a clean, branded shell ready for real resources. Use right after rebranding when starting a real product.
---

# Strip the demo

The demo is intentionally removable. Delete it, then add your own resources with
`add-crud-resource`.

## What is demo vs. platform

**Demo (remove):**
- `src/features/{products,orders,posts}/` and `src/routes/_app/{products,orders,posts}*.tsx`
- The `products`, `orders` tables in `src/db/schema.ts` (and a migration to drop them)
- Sample dashboard content in `src/routes/_app/index.tsx` (the fake STATS/charts)
- `src/lib/dashboard/chart-data.ts`, `scripts/seed.ts` demo seed
- The matching sidebar entries in `src/lib/sidebar-items.ts`

**Platform (keep):** everything in `src/components/*`, `src/infra/*`,
`src/config/*`, `src/lib/*` (auth, toast, utils), the routing shell, the auth
pages, the generator, and `src/db/schema.ts`'s better-auth tables.

## Steps

1. Delete the demo feature folders + routes listed above.
2. Remove the `products`/`orders` `pgTable` definitions (keep the better-auth
   tables) and run `bun run db:generate && bun run db:migrate` to drop them.
3. Remove the demo sidebar entries (keep the Dashboard item + the
   `// create-resource:anchor`).
4. Replace `src/routes/_app/index.tsx` with a minimal welcome (or your real
   dashboard built via `add-chart-page`).
5. Delete the obsolete tests under the removed feature folders.

## Verify

`bun run typecheck && bun run check && bun run test && bun run build` — all green
on the clean shell. The app boots to a branded, empty dashboard.
