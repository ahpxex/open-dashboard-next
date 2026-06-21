import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { setCookie } from "@tanstack/react-start/server";
import type { AuthProvider, AuthSession } from "@/lib/auth-provider";

/** The option bag `setCookie` accepts (CookieSerializeOptions from cookie-es). */
type SetCookieOptions = Parameters<typeof setCookie>[2];

/**
 * Supabase auth preset — server seam. Drop this in as `@/lib/auth-providers/supabase`
 * and point `authProvider` here (pair with `@/lib/auth-clients/supabase`).
 *
 * Supabase Auth runs on the Supabase origin and the browser client manages its
 * own cookies. On the server we still need a real SSR session exchange: when the
 * access token has expired, `@supabase/ssr` transparently refreshes it on the
 * first `getUser()` call and hands the refreshed access/refresh cookies to the
 * `setAll` callback — which we write back onto the OUTGOING response (via
 * TanStack Start's ambient `setCookie`) so the browser keeps a live session.
 * Without that write-back the server would refresh the token, throw it away, and
 * the next request would arrive with a stale cookie. `getUser()` (not
 * `getSession()`) is used for the trust decision because it verifies the JWT
 * against Supabase.
 *
 * Activate: `bun add @supabase/supabase-js @supabase/ssr`. Server-only.
 */

/** Cookie name/value pairs as `@supabase/ssr` expects from `getAll`. */
function parseCookies(headers: Headers): { name: string; value: string }[] {
  const header = headers.get("cookie");
  if (!header) return [];
  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf("=");
      // A valueless segment ("foo" or "foo=") has no real value: take the whole
      // segment (or everything before "=") as the name and an empty value.
      // `indexOf` returning -1 must NOT be fed to slice(0, -1) — that would drop
      // the last char of the name and mis-read the value.
      if (eq === -1) return { name: part, value: "" };
      return {
        name: part.slice(0, eq),
        value: decodeURIComponent(part.slice(eq + 1)),
      };
    });
}

/**
 * Build a per-request SSR server client. `getAll` reads the request cookies;
 * `setAll` writes any refreshed session cookies back onto the outgoing response
 * so the SSR refresh actually persists. Both reads and writes are bound to the
 * SAME ambient request/response, so this must run inside a server-fn / route
 * handler (where TanStack Start's `getRequest`/`setCookie` are in scope).
 */
function serverClient(headers: Headers) {
  return createServerClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: () => parseCookies(headers),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            // `options` is `@supabase/ssr`'s CookieOptions (Partial<SerializeOptions>
            // from `cookie`); `setCookie` wants CookieSerializeOptions from
            // `cookie-es`. Same runtime shape (path/domain/maxAge/expires/sameSite/
            // httpOnly/secure), nominally distinct packages — cast at the boundary.
            setCookie(name, value, options as SetCookieOptions);
          }
        },
      },
    },
  );
}

function toSession(user: User | null): AuthSession | null {
  if (!user) return null;
  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      name: (user.user_metadata?.name as string | undefined) ?? user.email ?? "",
    },
  };
}

export const supabaseAuthProvider: AuthProvider = {
  async getSession(headers) {
    const supabase = serverClient(headers);
    // getUser() verifies the JWT and, if it had expired, transparently refreshes
    // it — the refreshed cookies flow through `setAll` onto the response.
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return toSession(data.user);
  },

  // Supabase Auth itself is hosted on the Supabase origin; the browser client
  // signs in/out against `${SUPABASE_URL}/auth/v1/*` directly, so `/api/auth/*`
  // is NOT a full auth host here. Its one job is to service the SSR
  // cookie/session-refresh exchange: build the per-request server client, call
  // getUser() (which refreshes + writes the rotated cookies via `setAll`), and
  // return 204 — the refreshed `Set-Cookie` headers ride back on the response.
  async handler(request) {
    const supabase = serverClient(request.headers);
    await supabase.auth.getUser();
    return new Response(null, { status: 204 });
  },
};
