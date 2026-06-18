import { createServerFn } from "@tanstack/react-start";

/**
 * Read the current better-auth session on the server.
 * Use in route `beforeLoad` / loaders to gate access and hydrate the user.
 *
 * The auth provider (and therefore `@/lib/auth`/`@/db`/`pg`) is imported
 * dynamically inside the handler so this module — which IS imported by the
 * client-reachable `_app` route — never pulls the database client into the
 * browser module graph.
 */
export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { authProvider } = await import("@/lib/auth-provider");
    const { headers } = getRequest();
    return authProvider.getSession(headers);
  },
);
