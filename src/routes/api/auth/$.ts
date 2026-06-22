import { createFileRoute } from "@tanstack/react-router";
import { SKIP_AUTH } from "@/lib/demo-mode";

/**
 * Serve the better-auth HTTP endpoints. `authProvider` (and therefore
 * `@/lib/auth`/`@/db`/`pg`) is imported dynamically and short-circuited in
 * demo-deploy mode, so the database/auth chain never loads on a Workers runtime.
 */
async function handle(request: Request): Promise<Response> {
  if (SKIP_AUTH) {
    // No session backend in demo mode — report "anonymous" like better-auth does.
    return Response.json(null);
  }
  const { authProvider } = await import("@/lib/auth-provider");
  return authProvider.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
