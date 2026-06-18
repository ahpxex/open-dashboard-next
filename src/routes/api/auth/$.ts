import { createFileRoute } from "@tanstack/react-router";
import { authProvider } from "@/lib/auth-provider";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => authProvider.handler(request),
      POST: ({ request }) => authProvider.handler(request),
    },
  },
});
