import type { AuthUser } from "@/lib/auth-provider";

/**
 * Demo-deploy mode — bypass authentication entirely.
 *
 * When `VITE_SKIP_AUTH` is set (e.g. on a Cloudflare Pages preview), the auth
 * guard, `requireUser()`, and the user menu short-circuit to a fixed
 * {@link DEMO_USER} instead of resolving a real better-auth session. This makes
 * the app a public, no-login showcase that runs on the zero-config in-memory
 * adapters — appropriate on serverless runtimes (Workers isolates are ephemeral
 * and not shared, so a real session store would not persist anyway).
 *
 * It also keeps the database/auth backend (`@/lib/auth` → `@/db` → `pg`) out of
 * the statically-loaded server graph: the only modules that reach it
 * (`require-user`, the `/api/auth/*` route) import it dynamically and never run
 * in this mode, so the bundle stays Workers-friendly.
 *
 * Client-safe: this module pulls in no server-only code, and `import.meta.env`
 * is inlined identically into the client and server bundles at build time.
 *
 * DEFAULT IS OFF — leave `VITE_SKIP_AUTH` unset for the normal authenticated app.
 */
export const SKIP_AUTH =
  import.meta.env.VITE_SKIP_AUTH === "1" ||
  import.meta.env.VITE_SKIP_AUTH === "true";

/** The fixed identity every request runs as while {@link SKIP_AUTH} is on. */
export const DEMO_USER: AuthUser = {
  id: "demo-user",
  email: "demo@example.com",
  name: "Demo User",
  image: null,
};
