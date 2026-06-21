import { createServerClient } from "@supabase/ssr";
import type { AuthProvider } from "@/lib/auth-provider";

/**
 * Supabase auth preset — server seam. Drop this in as `@/lib/auth-providers/supabase`
 * and point `authProvider` here (pair with `@/lib/auth-clients/supabase`).
 *
 * Supabase Auth runs on the Supabase origin and the browser client manages its
 * own cookies, so `getSession` just reads the Supabase auth cookie off the
 * request and verifies the user via `getUser()` (which validates the JWT against
 * Supabase — use it, not `getSession()`, for a trust decision). There is no local
 * `/api/auth/*` host to serve, so `handler` returns 404.
 *
 * Activate: `bun add @supabase/supabase-js @supabase/ssr`. Server-only.
 */

function parseCookies(headers: Headers): { name: string; value: string }[] {
  const header = headers.get("cookie");
  if (!header) return [];
  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf("=");
      return {
        name: part.slice(0, eq),
        value: decodeURIComponent(part.slice(eq + 1)),
      };
    });
}

export const supabaseAuthProvider: AuthProvider = {
  async getSession(headers) {
    const supabase = createServerClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_ANON_KEY ?? "",
      {
        cookies: {
          getAll: () => parseCookies(headers),
          // Read-only on the guard path; refresh writes happen client-side.
          setAll: () => {},
        },
      },
    );
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const user = data.user;
    return {
      user: {
        id: user.id,
        email: user.email ?? "",
        name: (user.user_metadata?.name as string | undefined) ?? user.email ?? "",
      },
    };
  },

  // Supabase Auth is hosted on the Supabase origin; the browser client talks to
  // it directly, so there is no `/api/auth/*` to serve here.
  handler: async () => new Response("Not found", { status: 404 }),
};
