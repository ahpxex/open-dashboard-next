---
name: rebrand
description: Rebrand the app — change the product name, logo, description, theme, and navigation. Use when porting this template into a new product.
---

# Rebrand

The single rebrand surface is `src/config/app.ts` (`appConfig`). It is consumed
by the sidebar (logo + name + nav), the root document head (title +
description), the theme provider, and the auth pages (brand header). Nothing
else should hardcode the product name or logo.

## Steps

1. Edit `src/config/app.ts`:
   - `name` — product name (sidebar, `<title>`, auth header).
   - `description` — `<meta name="description">`.
   - `logo` — any Phosphor icon component (e.g. `import { RocketIcon }`).
   - `theme` — `{ defaultTheme: "light" | "dark" | "system", enableSystem }`.

2. **Navigation** lives in `src/lib/sidebar-items.ts` (`mainMenuItems`,
   `bottomMenuItems`), surfaced as `appConfig.nav`. Add/remove/reorder items;
   keep the `// create-resource:anchor` line (the generator inserts above it).

3. **Theme tokens** (colours) are CSS variables in `src/styles/app.css`
   (`--primary`, `--chart-1..5`, …) for light and `.dark`. Charts and StatusChips
   re-theme automatically.

## Verify

`bun run check`, then load the app: the sidebar, browser tab title, and the
login page all show the new brand. The `appConfig` unit test asserts the nav
invariants (`src/config/app.test.ts`).
