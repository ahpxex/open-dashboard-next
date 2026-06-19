---
name: trim-gallery
description: Remove the UI-shape gallery (all of it, or all but the variants your product keeps) — gallery routes, their local components, and their sidebar groups. Use when porting the template into a real product, after deciding which shapes you need.
---

# Trim the gallery

`src/routes/_app/gallery/*` ships a broad **palette** of admin UI shapes so an
agent can compose from them. A real product keeps a few and deletes the rest.
Every variant is self-contained, so trimming is pure deletion — nothing else
breaks.

## What the gallery is made of

- **Routes**: every file under `src/routes/_app/gallery/` (one per variant) + the
  `gallery/index.tsx` overview.
- **Gallery-only components**: `src/components/data/*`, `src/components/feedback/*`,
  and `src/components/form/ComboboxField.tsx` (used only by gallery demos).
- **Sidebar groups**: the `Gallery` and `Gallery · …` groups in
  `src/lib/sidebar-items.ts` (below the `// gallery:anchor` line).
- **Docs**: `docs/gallery-catalogue.md`.

Nothing else in the app imports these. Platform code (`src/infra`, the form
system, `src/components/ui`, charts) is **not** part of the gallery — keep it.

## Remove the whole gallery

```
rm -rf src/routes/_app/gallery src/components/data src/components/feedback
rm -f  src/components/form/ComboboxField.tsx docs/gallery-catalogue.md
```

Then in `src/lib/sidebar-items.ts` delete every group whose `groupLabel` starts
with `"Gallery"` (and the `// gallery:anchor` line). Verify:

```
bun run typecheck && bun run check && bun run test && bun run build
```

## Keep some, trim the rest

1. Decide which variants to keep (see `docs/gallery-catalogue.md`).
2. Delete the route file of every variant you don't keep (and any component under
   `components/data` / `components/feedback` only that variant used).
3. In `src/lib/sidebar-items.ts`, remove the sidebar entries for deleted variants;
   drop a `Gallery · …` group entirely if it's now empty.
4. Keep `gallery/index.tsx` only if you keep ≥1 variant; otherwise delete it and
   its sidebar group.
5. Verify with the four commands above; `bun run dev` and click each kept variant.

## Invariants

- Trimming only deletes — never edit platform layers to make a variant removable;
  each variant is already independent.
- After trimming, the app boots zero-config (in-memory backend) and all four
  checks pass on the slimmed-down shell.
