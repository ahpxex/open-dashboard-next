/**
 * Centralised environment resolution + the zero-config / fail-closed posture
 * required by CONTRACT.md §3.
 *
 * - `DATABASE_URL` unset  → SQLite (a local file by default, or `:memory:`),
 *   tables created automatically on boot. The service runs on a clean checkout
 *   with one install + one run command.
 * - `DATABASE_URL` set    → Postgres (the production path).
 * - `BETTER_AUTH_SECRET` unset in production → the service refuses to boot. In
 *   dev a clearly-labelled insecure fallback keeps zero-config working.
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
export const sqlitePath =
  process.env.SQLITE_PATH?.trim() || "./data.db";

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

/**
 * Optional bearer token guarding the **data** routes (the `/products` API).
 * CONTRACT §1 lets the frontend reach the data API over a trusted
 * server-to-server hop with no auth header — so when this is unset the data
 * routes stay open (zero-config dev keeps working). When set (non-empty),
 * every `/products` request must carry `Authorization: Bearer <DATA_API_TOKEN>`
 * or it is rejected with `401`. Auth routes (`/api/auth/*`) are never gated by
 * this — they have their own auth. In production, set it and have the dashboard
 * forward it (`restRepository` headers: `{ Authorization: 'Bearer <token>' }`).
 *
 * Read live from the environment (rather than frozen at import) so the value
 * reflects the process config without coupling to module-load order.
 */
export function getDataApiToken(): string | undefined {
  return process.env.DATA_API_TOKEN?.trim() || undefined;
}

/** better-auth `baseURL` — the origin this service is reached at. */
export const authBaseUrl =
  process.env.BETTER_AUTH_URL?.trim() || undefined;

/** HTTP port the service listens on. */
export const port = Number(process.env.PORT) || 8787;

export { isProduction };
