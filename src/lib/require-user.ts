import { getRequest } from "@tanstack/react-start/server";
import { authProvider } from "@/lib/auth-provider";

/**
 * Assert there is an authenticated user. Call ONLY inside server-fn handlers
 * that read or mutate protected data — throws if there is no session.
 *
 * Kept in its own module (separate from any client-imported file) so the
 * server-only auth/`getRequest` chain never leaks into the browser bundle.
 */
export async function requireUser() {
  const { headers } = getRequest();
  const session = await authProvider.getSession(headers);
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}
