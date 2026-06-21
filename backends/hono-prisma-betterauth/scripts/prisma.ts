#!/usr/bin/env bun
/**
 * Dialect-aware Prisma CLI wrapper — the one-command zero-config path
 * (CONTRACT.md §3). Picks the schema + datasource URL from the environment, then
 * shells out to the Prisma CLI:
 *
 *   - DATABASE_URL unset → SQLite (prisma/schema.prisma). The CLI reads the
 *     SQLite file location from PRISMA_DATABASE_URL, which we derive from
 *     SQLITE_PATH (default ./dev.db). Set here so `prisma db push` and the
 *     PrismaClient at runtime (src/db/index.ts) agree on the same file.
 *   - DATABASE_URL set    → Postgres (prisma/schema.postgres.prisma). The schema
 *     reads url = env("DATABASE_URL") directly.
 *
 * Subcommands:
 *   schema    print the active schema path (for debugging)
 *   generate  prisma generate --schema <active>      (postinstall)
 *   push      prisma db push --skip-generate --schema <active>  (predev/prestart)
 *
 * Used by package.json's predev/prestart/postinstall/pretest so the SQLite path
 * needs no manual migrate step.
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const here = new URL(".", import.meta.url).pathname;
const root = resolve(here, "..");

const databaseUrl = process.env.DATABASE_URL?.trim() || "";
const hasDatabase = databaseUrl.length > 0;

const sqliteSchema = resolve(root, "prisma/schema.prisma");
const postgresSchema = resolve(root, "prisma/schema.postgres.prisma");
const activeSchema = hasDatabase ? postgresSchema : sqliteSchema;

/**
 * SQLite connection string for the Prisma CLI + the runtime client. SQLITE_PATH
 * is a filesystem path (default ./dev.db, or :memory: for the test suite); Prisma
 * wants a `file:` URL. Relative file paths are resolved against the schema
 * directory by Prisma, so we make it absolute to keep CLI + runtime in sync.
 */
function sqliteUrl(): string {
  const raw = process.env.SQLITE_PATH?.trim() || "./dev.db";
  if (raw === ":memory:") return "file:memory?mode=memory&cache=shared";
  return `file:${resolve(root, raw)}`;
}

const childEnv: Record<string, string> = { ...process.env } as Record<
  string,
  string
>;
if (!hasDatabase) {
  childEnv.PRISMA_DATABASE_URL = sqliteUrl();
}

const command = process.argv[2];

if (command === "schema") {
  console.log(activeSchema);
  process.exit(0);
}

const prismaArgs: string[] =
  command === "generate"
    ? ["generate", "--schema", activeSchema]
    : command === "push"
      ? ["db", "push", "--skip-generate", "--schema", activeSchema]
      : (() => {
          console.error(`Unknown prisma wrapper command: ${command}`);
          process.exit(1);
        })();

const result = spawnSync("prisma", prismaArgs, {
  stdio: "inherit",
  env: childEnv,
  cwd: root,
});

process.exit(result.status ?? 0);
