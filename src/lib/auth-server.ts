import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

/**
 * Read the current better-auth session on the server.
 * Use in route `beforeLoad` / loaders to gate access and hydrate the user.
 */
export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const { headers } = getRequest();
    const session = await auth.api.getSession({ headers });
    return session ?? null;
  },
);
