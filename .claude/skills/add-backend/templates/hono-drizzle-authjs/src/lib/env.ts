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
 * Optional bearer token guarding the `/products` data routes (CONTRACT §1: "A
 * preset MAY additionally require a bearer token on data routes").
 *
 * - Unset (default) → the data API trusts its network and stays open, so
 *   zero-config dev + the contract suite keep working with no token.
 * - Set (non-empty) → every `/products` request MUST carry
 *   `Authorization: Bearer <DATA_API_TOKEN>`; the frontend forwards it via
 *   `restRepository`'s `headers`. The auth routes (`/api/auth/*`) are NOT gated
 *   by this — they run their own Auth.js CSRF + cookie flow.
 *
 * Read **live** from the environment (not captured at module load) so the guard
 * always reflects the current process env — the security decision should never
 * be frozen at import time.
 */
export function dataApiToken(): string | undefined {
  return process.env.DATA_API_TOKEN?.trim() || undefined;
}

/** HTTP port the service listens on. */
export const port = Number(process.env.PORT) || 8789;

export { isProduction };
