/**
 * strip-demo — remove the demo resources (products, orders, posts) and the
 * sample dashboard, leaving a clean, branded shell ready for real resources.
 *
 * Run it AFTER rebranding and BEFORE adding your own resources:
 *
 *   bun run strip-demo
 *
 * What it does (mirrors `.claude/skills/strip-demo`):
 *   - deletes the demo feature folders + their routes + the fake chart data
 *   - removes the `products`/`orders` tables from `src/db/schema.ts`
 *     (keeps the better-auth tables) and prunes now-unused imports
 *   - removes the demo sidebar entries (keeps Dashboard + the create-resource anchor)
 *   - replaces the sample dashboard with a minimal welcome page
 *   - rewrites the seed to only create the dev account
 *
 * It does NOT touch the database. After running, drop the demo tables with:
 *   bun run db:generate && bun run db:migrate
 *
 * Platform code (`src/components`, `src/infra`, `src/config`, `src/lib`, the
 * routing shell, auth pages, the generator) is left untouched.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const abs = (rel: string) => join(root, rel);

function info(msg: string) {
  console.log(msg);
}

/* -------------------------------------------------------------------------- */
/*  1. Delete demo feature folders, routes, and fake dashboard data            */
/* -------------------------------------------------------------------------- */

const deletions = [
  "src/features/products",
  "src/features/orders",
  "src/features/posts",
  "src/routes/_app/products.tsx",
  "src/routes/_app/products_.$id.tsx",
  "src/routes/_app/orders.tsx",
  "src/routes/_app/orders.$id.tsx",
  "src/routes/_app/posts.tsx",
  "src/lib/dashboard",
];

for (const rel of deletions) {
  const target = abs(rel);
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
    info(`  removed  ${rel}`);
  } else {
    info(`  skip     ${rel} (already gone)`);
  }
}

/* -------------------------------------------------------------------------- */
/*  Helpers for surgical source edits                                          */
/* -------------------------------------------------------------------------- */

/**
 * Drop named imports that are no longer referenced anywhere in the file body.
 * Operates on `import { ... } from "..."` (and `import type { ... }`) statements
 * only; rebuilds or removes each statement based on remaining usage.
 */
function pruneUnusedNamedImports(source: string): string {
  // Everything that is not an import statement — used to test real usage.
  const body = source.replace(/import\b[\s\S]*?from\s*['"][^'"]+['"];?/g, "");

  return source.replace(
    /import\s+(type\s+)?\{([^}]*)\}\s+from\s+(['"][^'"]+['"]);?/g,
    (_full, typeKw: string | undefined, inner: string, from: string) => {
      const specs = inner
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const kept = specs.filter((spec) => {
        const local = spec
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)
          .pop()!
          .trim();
        return new RegExp(`\\b${local}\\b`).test(body);
      });

      if (kept.length === 0) return ""; // whole statement is dead
      return `import ${typeKw ?? ""}{ ${kept.join(", ")} } from ${from};`;
    },
  );
}

function edit(rel: string, fn: (source: string) => string) {
  const target = abs(rel);
  if (!existsSync(target)) {
    info(`  skip     ${rel} (not found)`);
    return;
  }
  const next = fn(readFileSync(target, "utf8"));
  writeFileSync(target, next);
  info(`  edited   ${rel}`);
}

/* -------------------------------------------------------------------------- */
/*  2. Remove demo tables from the Drizzle schema                              */
/* -------------------------------------------------------------------------- */

edit("src/db/schema.ts", (source) => {
  // Demo tables live in the "Application tables" section, which is the tail of
  // the file. Cut from that comment block to EOF, then prune unused imports.
  const marker = source.indexOf("Application tables");
  if (marker !== -1) {
    const blockStart = source.lastIndexOf("/* -", marker);
    const cut = blockStart === -1 ? marker : blockStart;
    source = `${source.slice(0, cut).trimEnd()}\n`;
  }
  return pruneUnusedNamedImports(source);
});

/* -------------------------------------------------------------------------- */
/*  3. Remove demo sidebar entries                                             */
/* -------------------------------------------------------------------------- */

edit("src/lib/sidebar-items.ts", (source) => {
  const pruned = source
    .split("\n")
    .filter((line) => !/href:\s*"\/(products|orders|posts)"/.test(line))
    .join("\n");
  return pruneUnusedNamedImports(pruned);
});

/* -------------------------------------------------------------------------- */
/*  4. Replace the sample dashboard with a minimal welcome page                */
/* -------------------------------------------------------------------------- */

edit("src/routes/_app/index.tsx", () => {
  return `import { createFileRoute } from "@tanstack/react-router";

import { appConfig } from "@/config/app";

export const Route = createFileRoute("/_app/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Welcome to {appConfig.name}
      </h1>
      <p className="max-w-prose text-sm text-muted-foreground">
        Signed in as {user.name}. This is your clean shell — add your first
        resource with{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          bun run create-resource &lt;name&gt;
        </code>{" "}
        to get started.
      </p>
    </div>
  );
}
`;
});

/* -------------------------------------------------------------------------- */
/*  5. Rewrite the seed to only create the dev account                         */
/* -------------------------------------------------------------------------- */

edit("scripts/seed.ts", () => {
  return `import { eq } from "drizzle-orm";
import { db } from "../src/db/index.ts";
import { accounts, users } from "../src/db/schema.ts";
import { auth } from "../src/lib/auth.ts";

async function seed() {
  // Known local dev account. Hash the password with better-auth's own hasher
  // so \`signIn.email\` works exactly like a real registration.
  const devEmail = "dev@example.com";
  const devPassword = "password";
  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(devPassword);

  await db.delete(users).where(eq(users.email, devEmail));
  const devUserId = crypto.randomUUID();
  await db.insert(users).values({
    id: devUserId,
    name: "Dev User",
    email: devEmail,
    emailVerified: true,
  });
  await db.insert(accounts).values({
    id: crypto.randomUUID(),
    accountId: devUserId,
    providerId: "credential",
    userId: devUserId,
    password: hashedPassword,
  });
  console.log(\`✓ Dev account: \${devEmail} / \${devPassword}\`);

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
`;
});

/* -------------------------------------------------------------------------- */
/*  6. Format the edited files                                                 */
/* -------------------------------------------------------------------------- */

const formatTargets = [
  "src/db/schema.ts",
  "src/lib/sidebar-items.ts",
  "src/routes/_app/index.tsx",
  "scripts/seed.ts",
].filter((rel) => existsSync(abs(rel)));

try {
  execFileSync("bunx", ["biome", "check", "--write", ...formatTargets], {
    stdio: "ignore",
  });
  info("  formatted edited files with biome");
} catch {
  info("  (biome formatting skipped — run `bun run format` manually)");
}

/* -------------------------------------------------------------------------- */

info("\nDemo stripped. Next steps:");
info("  1. bun run db:generate && bun run db:migrate   # drop the demo tables");
info(
  "  2. bun run typecheck && bun run check && bun run test && bun run build",
);
info(
  "  3. bun run create-resource <name>              # add your first resource",
);
