/**
 * Prisma client — a single shared instance for the whole service.
 *
 * The datasource URL is resolved in `src/lib/env.ts` (mirroring
 * `scripts/prisma.ts`, which runs `prisma db push` before boot), and passed
 * explicitly to the constructor so the runtime client and the CLI that created
 * the tables always point at the same SQLite/Postgres database — including the
 * test suite's `./test.db` file.
 *
 * Which physical tables exist (SQLite vs Postgres) is decided by which schema
 * `prisma db push` ran against; the generated client is structurally identical
 * either way, so `products.ts` and `auth.ts` are written once.
 */
import { PrismaClient } from "@prisma/client";
import { dialect, prismaDatasourceUrl } from "../lib/env";

export const prisma = new PrismaClient({
  datasources: { db: { url: prismaDatasourceUrl } },
});

export { dialect };
