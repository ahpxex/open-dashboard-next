/**
 * sync-skills — generate each skill's bundled `templates/` from the live repo
 * source files (the single source of truth), so distributed skills always carry
 * code that the repo has typechecked/built/tested.
 *
 *   bun run sync-skills           # copy repo sources -> .claude/skills/<skill>/templates/
 *   bun run sync-skills --check   # fail (exit 1) if any bundle drifts from its source
 *
 * One-way only (repo -> skills). NEVER hand-edit a file under templates/ — edit
 * the repo source and re-run. The repo's gallery/feature files double as the live
 * test for every bundled template.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const root = process.cwd();
const skillsDir = join(root, ".claude/skills");

/** skill name -> repo source files copied verbatim into that skill's templates/. */
const MANIFEST: Record<string, string[]> = {
  // Gallery shapes
  "add-list-view": [
    "src/routes/_app/gallery/list-lite.tsx",
    "src/routes/_app/gallery/list-lazy.tsx",
  ],
  "add-infinite-list": ["src/routes/_app/gallery/list-infinite.tsx"],
  "add-virtual-table": ["src/routes/_app/gallery/table-virtual.tsx"],
  "add-inline-edit": ["src/routes/_app/gallery/table-inline-edit.tsx"],
  "add-filter-panel": ["src/routes/_app/gallery/filter-panel.tsx"],
  "add-kanban": ["src/routes/_app/gallery/kanban.tsx"],
  "add-tree-view": ["src/routes/_app/gallery/tree.tsx"],
  "add-calendar": ["src/routes/_app/gallery/calendar.tsx"],
  "add-timeline": ["src/routes/_app/gallery/timeline.tsx"],
  "add-wizard-form": ["src/routes/_app/gallery/form-wizard.tsx"],
  "add-field-combobox": [
    "src/routes/_app/gallery/form-combobox.tsx",
    "src/components/form/ComboboxField.tsx",
  ],
  "add-record-tabs": ["src/routes/_app/gallery/record-tabs.tsx"],
  "add-settings-page": [
    "src/routes/_app/gallery/control-page.tsx",
    "src/routes/_app/gallery/profile.tsx",
  ],
  "add-empty-state": ["src/routes/_app/gallery/empty-state.tsx"],
  "add-page-layout": ["src/routes/_app/gallery/split-layout.tsx"],
  "add-data-display": [
    "src/routes/_app/gallery/data-display.tsx",
    "src/components/data/TagList.tsx",
    "src/components/data/MetadataList.tsx",
    "src/components/data/ProgressTile.tsx",
    "src/components/data/UserCell.tsx",
  ],
  "add-feedback-states": [
    "src/routes/_app/gallery/feedback.tsx",
    "src/components/feedback/StateView.tsx",
  ],
  // Form variants (the dialog lives in the CRUD vertical; these are the page forms)
  "add-form": [
    "src/routes/_app/gallery/form-page.tsx",
    "src/routes/_app/gallery/form-scroll.tsx",
    "src/routes/_app/gallery/form-fixed.tsx",
    "src/routes/_app/gallery/form-array.tsx",
    "src/routes/_app/gallery/form-actions.tsx",
  ],
  // Core archetype routes (the canonical wired examples)
  "add-detail-page": ["src/routes/_app/products_.$id.tsx"],
  "add-master-detail": [
    "src/routes/_app/orders.tsx",
    "src/routes/_app/orders.$id.tsx",
  ],
  "add-card-list": ["src/routes/_app/posts.tsx"],
  "add-chart-page": ["src/routes/_app/index.tsx"],
};

const check = process.argv.includes("--check");
let drift = 0;
let copied = 0;
let missing = 0;

for (const [skill, sources] of Object.entries(MANIFEST)) {
  const templatesDir = join(skillsDir, skill, "templates");
  for (const src of sources) {
    const from = join(root, src);
    if (!existsSync(from)) {
      console.error(`  missing source: ${src} (for ${skill})`);
      missing++;
      continue;
    }
    const to = join(templatesDir, basename(src));
    const content = readFileSync(from, "utf8");

    if (check) {
      const current = existsSync(to) ? readFileSync(to, "utf8") : null;
      if (current !== content) {
        console.error(`  drift: ${skill}/templates/${basename(src)} != ${src}`);
        drift++;
      }
    } else {
      mkdirSync(templatesDir, { recursive: true });
      writeFileSync(to, content);
      copied++;
    }
  }
}

if (check) {
  if (drift || missing) {
    console.error(
      `\n${drift} drifted, ${missing} missing — run \`bun run sync-skills\`.`,
    );
    process.exit(1);
  }
  console.log("skills in sync with repo sources.");
} else {
  console.log(
    `synced ${copied} template(s)${missing ? `, ${missing} missing source(s)` : ""}.`,
  );
  if (missing) process.exit(1);
}
