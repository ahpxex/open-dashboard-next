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
// 2b. all feature resources, and the gallery-only components.
rm(join(base, "src/features"));
rm(join(base, "src/components/data"));
rm(join(base, "src/components/feedback"));
rm(join(base, "src/components/form/ComboboxField.tsx"));
rm(join(base, "src/lib/dashboard"));
// 2c. dev-only scripts that don't belong in a distributed base.
for (const s of ["strip-demo.ts", "sync-skills.ts", "build-base.ts"]) {
  rm(join(base, "scripts", s));
}

// 3. Apply the clean overrides (better-auth-only schema, minimal nav + welcome,
//    dev-account seed, and a product-oriented CLAUDE.md — the repo's CLAUDE.md is
//    substrate-maintenance guidance that doesn't apply to a scaffolded product).
const overrides: [string, string][] = [
  ["schema.ts", "src/db/schema.ts"],
  ["sidebar-items.ts", "src/lib/sidebar-items.ts"],
  ["index.tsx", "src/routes/_app/index.tsx"],
  ["seed.ts", "scripts/seed.ts"],
  ["CLAUDE.md", "CLAUDE.md"],
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
  for (const s of ["strip-demo", "sync-skills", "build-base"]) {
    delete pkg.scripts[s];
  }
}
execFileSync("tee", [pkgPath], {
  input: `${JSON.stringify(pkg, null, 2)}\n`,
  stdio: ["pipe", "ignore", "inherit"],
});

console.log(`base assembled at ${base}`);
