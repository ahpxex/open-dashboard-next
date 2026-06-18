import { auth } from "@/lib/auth";

/**
 * The server-side auth seam.
 *
 * The app reaches authentication ONLY through this interface — `getSession` for
 * guards/handlers and `handler` for the `/api/auth/*` routes. That makes the auth
 * backend a swappable preset (better-auth + Postgres today; Supabase or an
 * external-API JWT tomorrow): implement `AuthProvider` and point `authProvider`
 * at it, and nothing else in the app changes. This mirrors how the data layer
 * swaps behind the `Repository` interface.
 *
 * Server-only: this module statically imports `@/lib/auth` (and therefore the DB
 * client), so it must only be reached from server-only modules — directly from
 * `require-user`/the api route, and via dynamic `import()` from the
 * client-reachable `auth-server`.
 *
 * The browser half of the seam is `@/lib/auth-client` (sign-in/up/out + session
 * hook); swapping the preset reimplements that file too.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface AuthSession {
  user: AuthUser;
}

export interface AuthProvider {
  /** Resolve the current session from request headers, or `null` if anonymous. */
  getSession(headers: Headers): Promise<AuthSession | null>;
  /** Serve the auth HTTP endpoints mounted at `/api/auth/*`. */
  handler(request: Request): Promise<Response>;
}

/** better-auth implementation (email + password, sessions via the configured adapter). */
export const betterAuthProvider: AuthProvider = {
  async getSession(headers) {
    const session = await auth.api.getSession({ headers });
    return session ? { user: session.user } : null;
  },
  handler: (request) => auth.handler(request),
};

/**
 * The active auth backend. Swap this single binding (and `@/lib/auth-client`) to
 * change the auth preset — see the `add-backend-preset` skill.
 */
export const authProvider: AuthProvider = betterAuthProvider;
