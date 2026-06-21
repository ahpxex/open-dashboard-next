/**
 * Database client — picks the dialect from the environment and creates tables
 * automatically on boot for the zero-config SQLite path (CONTRACT.md §3: no
 * manual migrate step).
 *
 * - No `DATABASE_URL`  → bun:sqlite via drizzle-orm/bun-sqlite. Tables are
 *   created idempotently with `CREATE TABLE IF NOT EXISTS` on first run.
 * - `DATABASE_URL` set → Postgres via drizzle-orm/node-postgres. Tables are
 *   likewise ensured on boot so the preset runs without a separate migrate step;
 *   in a real deployment you'd manage these with drizzle-kit migrations.
 *
 * The rest of the service imports `db` (a drizzle instance) and `schema` (the
 * dialect-matched table set). Because both schemas share identical column names
 * and a compatible logical shape, `products.ts` / `auth.ts` / `register.ts` are
 * written once against the shared field names.
 */
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { hasDatabase } from "../lib/env";
import type { schema as sqliteSchemaTables } from "./schema.sqlite";

type Dialect = "sqlite" | "pg";

/**
 * The drizzle client, given a single concrete static type so the data layer is
 * fully typechecked (replacing the former `any`, which erased Drizzle's
 * type-safety and `noUncheckedIndexedAccess` coverage).
 *
 * At runtime `db` is either the bun-sqlite client (zero-config) or the
 * node-postgres client (when `DATABASE_URL` is set), picked by the branch below.
 * The two are written against and queried through the **same** table schema
 * (identical column names; the dialect tables differ only in underlying SQL
 * types), so a single concrete type — the SQLite client over the shared
 * schema — describes every call site precisely. The Postgres instance is
 * structurally equivalent for the query-builder surface this preset uses
 * (`select`/`insert`/`update`/`delete` + `.where`/`.orderBy`/`.limit`/`.offset`),
 * so it is adapted to this type at the one assignment seam below. Picking one
 * concrete type (rather than a union of the two `drizzle()` return types) is what
 * keeps the builder methods callable: TypeScript can't reconcile the pg and
 * sqlite overload sets into a single callable union.
 */
export type DbClient = BunSQLiteDatabase<typeof sqliteSchemaTables>;

/** The dialect-matched table set (`products` / `users`), keyed identically
 * across dialects. */
export type Schema = typeof sqliteSchemaTables;

let dbInstance: DbClient;
let schemaInstance: Schema;
let dialectValue: Dialect;

if (hasDatabase) {
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { Pool } = await import("pg");
  const pgSchema = await import("./schema.pg");
  const { databaseUrl } = await import("../lib/env");

  const pool = new Pool({ connectionString: databaseUrl });
  // The pg client is queried through the same shared schema and builder surface
  // as the sqlite one; adapt it to the canonical DbClient at this single seam.
  dbInstance = drizzle(pool, {
    schema: pgSchema.schema,
  }) as unknown as DbClient;
  schemaInstance = pgSchema.schema as unknown as Schema;
  dialectValue = "pg";
  await ensurePgTables(pool);
} else {
  const { drizzle } = await import("drizzle-orm/bun-sqlite");
  const { Database } = await import("bun:sqlite");
  const sqliteSchema = await import("./schema.sqlite");
  const { sqlitePath } = await import("../lib/env");

  const sqlite = new Database(sqlitePath);
  sqlite.exec("PRAGMA journal_mode = WAL;");
  sqlite.exec("PRAGMA foreign_keys = ON;");
  ensureSqliteTables(sqlite);
  dbInstance = drizzle(sqlite, { schema: sqliteSchema.schema });
  schemaInstance = sqliteSchema.schema;
  dialectValue = "sqlite";
}

export const db: DbClient = dbInstance;
export const schema: Schema = schemaInstance;
export const dialect: Dialect = dialectValue;

function ensureSqliteTables(sqlite: import("bun:sqlite").Database): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      createdAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);
}

async function ensurePgTables(pool: import("pg").Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      category TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL,
      stock INTEGER NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now()
    );
  `);
}
