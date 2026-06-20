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
import { copyFileSync, existsSync, readdirSync, rmSync } from "node:fs";
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
    "--exclude=src/routeTree.gen.ts",
    "--exclude=docs",
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
// 2d. template-maintenance docs that don't apply to a scaffolded product.
for (const d of ["PORTING.md", "ROADMAP.md", "PATTERNS.md"]) {
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
];
for (const [from, to] of overrides) {
  copyFileSync(join(clean, from), join(base, to));
}

// 4. Drop the repo-only scripts from package.json.
const pkgPath = join(base, "package.json");
const pkg = JSON.parse(
  execFileSync("cat", [pkgPath], { encoding: "utf8" }),
) as { scripts?: Record<string, string> };
if (pkg.scripts) {
  for (const s of ["sync-skills", "build-base"]) {
    delete pkg.scripts[s];
  }
}
execFileSync("tee", [pkgPath], {
  input: `${JSON.stringify(pkg, null, 2)}\n`,
  stdio: ["pipe", "ignore", "inherit"],
});

console.log(`base assembled at ${base}`);
