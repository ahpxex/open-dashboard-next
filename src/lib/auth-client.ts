import { createAuthClient } from "better-auth/react";

/**
 * The browser half of the auth seam (the server half is `@/lib/auth-provider`).
 * Auth pages and the user menu import `signIn`/`signUp`/`signOut`/`useSession`
 * from here, so swapping the auth preset (e.g. to Supabase or an external API)
 * means reimplementing this one file with the new client — the pages don't change.
 */
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;

export type SessionUser = typeof authClient.$Infer.Session.user;
