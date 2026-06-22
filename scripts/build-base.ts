/**
 * build-base — assemble the clean dashboard foundation that the
 * `scaffold-dashboard` skill bundles. Copies the repo, strips all demo/scenario/
 * gallery content, applies the clean overrides, and prunes dev-only scripts, into
 * `.claude/skills/scaffold-dashboard/base/`. Generated artifact — re-run after
 * changing the platform layer. Pairs with `sync-skills` (shape templates).
 *
 *   bun run build-base
 */

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const skill = join(root, ".claude/skills/scaffold-dashboard");
const base = join(skill, "base");
const clean = join(skill, "clean");

const rm = (p: string) =>
  existsSync(p) && rmSync(p, { recursive: true, force: true });

// 1. Fresh copy of the repo (platform + demos), minus build/vcs/bundle artifacts.
rm(base);
execFileSync(
  "rsync",
  [
    "-a",
    "--exclude=node_modules",
    "--exclude=.git",
    "--exclude=.output",
    "--exclude=.nitro",
    "--exclude=.claude",
    "--exclude=.claude-plugin",
    "--exclude=drizzle",
    "--exclude=dist",
    "--exclude=.env",
    "--exclude=.vscode",
    "--exclude=.github",
    "--exclude=.githooks",
    "--exclude=src/routeTree.gen.ts",
    "--exclude=docs",
    // The standalone backend presets are distributed via the add-backend skill
    // (its templates/), not bundled into every scaffolded app. The dormant
    // frontend wiring (src/lib/auth-providers, auth-clients) DOES stay in the base.
    "--exclude=backends",
    `${root}/`,
    `${base}/`,
  ],
  { stdio: "inherit" },
);

// 2. Strip demo/scenario/gallery code — keep only the platform shell.
// 2a. routes/_app: keep the platform routes, drop every demo/scenario/gallery one.
const keepRoutes = new Set(["index.tsx", "settings.tsx", "errors"]);
const appRoutes = join(base, "src/routes/_app");
for (const entry of readdirSync(appRoutes)) {
  if (!keepRoutes.has(entry)) rm(join(appRoutes, entry));
}
// 2b. all feature resources, plus every gallery-only module. Each of these is
// the canonical source of an `add-*` skill (its `MANIFEST` entry in
// sync-skills.ts) and is reachable only from a gallery route — so it belongs
// with its skill, not in the clean base. The matching skill `cp`s it back in
// when a product opts into that shape. Keep this list in lockstep with the
// gallery-only modules; a straggler ships as dead code in the scaffold.
const galleryOnlyModules = [
  // feature resources (the business cases + their sample dashboard data)
  "src/features",
  // display & feedback building blocks
  "src/components/data",
  "src/components/feedback",
  // form-field shapes
  "src/components/form/ComboboxField.tsx", // add-field-combobox
  "src/components/form/FileField.tsx", // add-file-upload
  "src/infra/storage", // add-file-upload (storage seam)
  // table / list shapes
  "src/infra/table/ColumnControls.tsx", // add-table-columns
  "src/infra/table/SavedViews.tsx", // add-saved-views
  "src/infra/data/csv.ts", // add-export-import
  // cross-cutting feature components
  "src/components/GlobalSearch.tsx", // add-global-search
  "src/components/NotificationCenter.tsx", // add-notifications / add-realtime
  "src/components/RoleGate.tsx", // add-rbac
  "src/lib/rbac.ts", // add-rbac
  "src/lib/i18n.tsx", // add-i18n
  "src/lib/use-live-query.ts", // add-realtime
  "src/components/billing", // add-billing
  "src/components/auth", // add-auth-method (SocialButtons)
];
for (const mod of galleryOnlyModules) rm(join(base, mod));
// 2c. dev-only scripts that don't belong in a distributed base.
for (const s of ["sync-skills.ts", "build-base.ts"]) {
  rm(join(base, "scripts", s));
}
// 2c-bis. Cloudflare demo-deploy wiring (no-login showcase build). This is a
// repo-only deploy recipe (docs/deploy-cloudflare.md) — the clean base stays
// deploy-agnostic and ships no auth bypass. The files reverted to their pristine,
// pre-demo-mode form are in the overrides list below (vite.config + the auth seam).
for (const f of ["wrangler.jsonc", "src/lib/demo-mode.ts", "src/lib/stubs"]) {
  rm(join(base, f));
}
// 2d. template-maintenance docs + the substrate's translated README that don't
//     apply to a scaffolded product (the English README.md is replaced by the
//     clean override below).
for (const d of [
  "PORTING.md",
  "ROADMAP.md",
  "PATTERNS.md",
  "README.zh-CN.md",
]) {
  rm(join(base, d));
}

// 3. Apply the clean overrides (better-auth-only schema, minimal nav + welcome,
//    dev-account seed, and product-oriented CLAUDE.md + README — the repo's docs
//    are substrate guidance that doesn't apply to a scaffolded product).
const overrides: [string, string][] = [
  ["schema.ts", "src/db/schema.ts"],
  ["sidebar-items.ts", "src/lib/sidebar-items.ts"],
  ["index.tsx", "src/routes/_app/index.tsx"],
  ["seed.ts", "scripts/seed.ts"],
  ["CLAUDE.md", "CLAUDE.md"],
  ["README.md", "README.md"],
  // Pristine, pre-demo-mode versions of the files the Cloudflare no-login build
  // edits in the repo — so the scaffold base carries no skip-auth bypass and no
  // Cloudflare-specific build wiring. Keep in sync with the repo originals.
  ["vite.config.ts", "vite.config.ts"],
  ["app-layout-route.tsx", "src/routes/_app.tsx"],
  ["require-user.ts", "src/lib/require-user.ts"],
  ["api-auth-route.ts", "src/routes/api/auth/$.ts"],
  ["user-avatar.tsx", "src/components/UserAvatar.tsx"],
];
for (const [from, to] of overrides) {
  copyFileSync(join(clean, from), join(base, to));
}

// 4. Drop the repo-only scripts + the Cloudflare-demo deploy deps/scripts from
//    package.json — the clean base is deploy-agnostic (see step 2c-bis). The base
//    bun.lock still lists the CF deps, but scaffold.sh runs a non-frozen
//    `bun install` that reconciles it.
const pkgPath = join(base, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
if (pkg.scripts) {
  for (const s of [
    "sync-skills",
    "build-base",
    "build:cf",
    "preview:cf",
    "deploy:cf",
    "cf-typegen",
  ]) {
    delete pkg.scripts[s];
  }
}
if (pkg.devDependencies) {
  for (const d of ["@cloudflare/vite-plugin", "wrangler"]) {
    delete pkg.devDependencies[d];
  }
}
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(`base assembled at ${base}`);
