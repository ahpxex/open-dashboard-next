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
 * and a compatible logical shape, `products.ts` and `auth.ts` are written once
 * against the shared field names.
 */
import { hasDatabase } from "../lib/env";

type Dialect = "sqlite" | "pg";

// These are assigned exactly once below, then frozen by module evaluation.
// biome-ignore lint: intentional late init guarded by the branch below.
let dbInstance: any;
// biome-ignore lint: see above.
let schemaInstance: any;
let dialectValue: Dialect;

if (hasDatabase) {
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { Pool } = await import("pg");
  const pgSchema = await import("./schema.pg");
  const { databaseUrl } = await import("../lib/env");

  const pool = new Pool({ connectionString: databaseUrl });
  dbInstance = drizzle(pool, { schema: pgSchema.schema });
  schemaInstance = pgSchema;
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
  schemaInstance = sqliteSchema;
  dialectValue = "sqlite";
}

export const db = dbInstance;
export const schema = schemaInstance;
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

    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      emailVerified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      expiresAt INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      accountId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      accessToken TEXT,
      refreshToken TEXT,
      idToken TEXT,
      accessTokenExpiresAt INTEGER,
      refreshTokenExpiresAt INTEGER,
      scope TEXT,
      password TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expiresAt INTEGER NOT NULL,
      createdAt INTEGER DEFAULT (unixepoch()),
      updatedAt INTEGER DEFAULT (unixepoch())
    );
  `);
}

async function ensurePgTables(
  pool: import("pg").Pool,
): Promise<void> {
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

    CREATE TABLE IF NOT EXISTS "user" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL DEFAULT false,
      image TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      "expiresAt" TIMESTAMP NOT NULL,
      token TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP NOT NULL,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMP,
      "refreshTokenExpiresAt" TIMESTAMP,
      scope TEXT,
      password TEXT,
      "createdAt" TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP DEFAULT now(),
      "updatedAt" TIMESTAMP DEFAULT now()
    );
  `);
}
