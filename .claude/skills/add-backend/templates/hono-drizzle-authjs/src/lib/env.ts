/**
 * Centralised environment resolution + the zero-config / fail-closed posture
 * required by CONTRACT.md §3.
 *
 * - `DATABASE_URL` unset  → SQLite (a local file by default, or `:memory:`),
 *   tables created automatically on boot. The service runs on a clean checkout
 *   with one install + one run command.
 * - `DATABASE_URL` set    → Postgres (the production path).
 * - `AUTH_SECRET` unset in production → the service refuses to boot. In dev a
 *   clearly-labelled insecure fallback keeps zero-config working.
 */

const isProduction = process.env.NODE_ENV === "production";

export const databaseUrl = process.env.DATABASE_URL?.trim() || undefined;

/** True when a real Postgres connection string is configured. */
export const hasDatabase = Boolean(databaseUrl);

/**
 * Where the SQLite file lives when no `DATABASE_URL` is set. `:memory:` (used by
 * the test suite) keeps everything in-process; otherwise a file next to the
 * service so data survives restarts.
 */
export const sqlitePath = process.env.SQLITE_PATH?.trim() || "./data.db";

const DEV_AUTH_SECRET = "dev-only-insecure-secret-change-me";

/**
 * Auth.js session-signing secret (`AUTH_SECRET`). Fails closed in production
 * rather than falling back to a public value — mirrors the frontend's
 * `src/lib/auth.ts`.
 */
export const authSecret: string = (() => {
  const fromEnv =
    process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (isProduction) {
    throw new Error(
      "AUTH_SECRET must be set in production (generate one with `openssl rand -base64 32`).",
    );
  }
  return DEV_AUTH_SECRET;
})();

/**
 * The frontend origin allowed for CORS (the remote-authjs proxy forwards cookies
 * server-side, so this is belt-and-suspenders for direct browser calls).
 * Defaults to the scaffold's dev server.
 */
export const frontendOrigin =
  process.env.FRONTEND_ORIGIN?.trim() || "http://localhost:3000";

/**
 * Auth.js `AUTH_URL` — the origin this service is reached at, including the
 * `/api/auth` base path. Optional in dev: when unset, `@hono/auth-js` derives the
 * origin from the request (host / x-forwarded-host), which works on whatever port
 * the service lands on. Set it in production behind a proxy.
 */
export const authUrl = process.env.AUTH_URL?.trim() || undefined;

/** HTTP port the service listens on. */
export const port = Number(process.env.PORT) || 8789;

export { isProduction };
