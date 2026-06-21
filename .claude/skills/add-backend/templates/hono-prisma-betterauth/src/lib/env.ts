/**
 * Centralised environment resolution + the zero-config / fail-closed posture
 * required by CONTRACT.md §3.
 *
 * - `DATABASE_URL` unset  → SQLite (Prisma, a local file by default, or an
 *   in-memory shared DB), tables created automatically on boot via
 *   `prisma db push` (run by predev/prestart). The service runs on a clean
 *   checkout with one install + one run command.
 * - `DATABASE_URL` set    → Postgres (the production path).
 * - `BETTER_AUTH_SECRET` unset in production → the service refuses to boot. In
 *   dev a clearly-labelled insecure fallback keeps zero-config working.
 */

const isProduction = process.env.NODE_ENV === "production";

export const databaseUrl = process.env.DATABASE_URL?.trim() || undefined;

/** True when a real Postgres connection string is configured. */
export const hasDatabase = Boolean(databaseUrl);

/** Which Prisma datasource is active. */
export const dialect: "sqlite" | "pg" = hasDatabase ? "pg" : "sqlite";

/**
 * Where the SQLite file lives when no `DATABASE_URL` is set. `:memory:` (used by
 * the test suite) keeps everything in-process; otherwise a file next to the
 * service so data survives restarts.
 */
export const sqlitePath = process.env.SQLITE_PATH?.trim() || "./dev.db";

/**
 * The `file:`/`postgres:` URL Prisma's runtime client connects with. Mirrors the
 * resolution in `scripts/prisma.ts` so the CLI (`prisma db push`) and the runtime
 * client agree on the exact same database.
 */
export const prismaDatasourceUrl: string = hasDatabase
  ? (databaseUrl as string)
  : sqlitePath === ":memory:"
    ? "file:memory?mode=memory&cache=shared"
    : `file:${new URL(`../../${sqlitePath}`, import.meta.url).pathname}`;

const DEV_AUTH_SECRET = "dev-only-insecure-secret-change-me";

/**
 * Session-signing secret. Fails closed in production rather than falling back to
 * a public value — mirrors the frontend's `src/lib/auth.ts`.
 */
export const authSecret: string = (() => {
  const fromEnv = process.env.BETTER_AUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (isProduction) {
    throw new Error(
      "BETTER_AUTH_SECRET must be set in production (generate one with `openssl rand -base64 32`).",
    );
  }
  return DEV_AUTH_SECRET;
})();

/**
 * The frontend origin allowed for CORS + better-auth CSRF (`trustedOrigins`).
 * Defaults to the scaffold's dev server.
 */
export const frontendOrigin =
  process.env.FRONTEND_ORIGIN?.trim() || "http://localhost:3000";

/** better-auth `baseURL` — the origin this service is reached at. */
export const authBaseUrl = process.env.BETTER_AUTH_URL?.trim() || undefined;

/** HTTP port the service listens on. 8788 so it does not clash with the Drizzle preset (8787). */
export const port = Number(process.env.PORT) || 8788;

export { isProduction };
