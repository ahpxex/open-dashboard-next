import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { AuthSession, AuthUser } from "@/lib/auth-provider";

/**
 * Supabase auth preset — browser seam. Drop in as `@/lib/auth-clients/supabase`
 * and re-export it from `@/lib/auth-client`. Mirrors the better-auth client
 * surface the pages and `UserAvatar` use (`signIn.email`, `signUp.email`,
 * `signOut`, `useSession`) so activating Supabase is a one-line client swap.
 *
 * Activate: `bun add @supabase/supabase-js @supabase/ssr`.
 */

const supabase = createBrowserClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

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

export const authClient = {
  signIn: {
    email: ({ email, password }: { email: string; password: string }) =>
      supabase.auth.signInWithPassword({ email, password }),
  },
  signUp: {
    email: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) =>
      supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      }),
  },
  signOut: () => supabase.auth.signOut(),
  useSession: () => {
    const [data, setData] = useState<AuthSession | null>(null);
    const [isPending, setIsPending] = useState(true);
    useEffect(() => {
      // Guard against the initial getUser() resolving after unmount (React would
      // warn about setState on an unmounted component, and we'd leak the update).
      let active = true;
      supabase.auth
        .getUser()
        .then(({ data: { user } }) => {
          if (active) setData(toSession(user));
        })
        .finally(() => {
          if (active) setIsPending(false);
        });
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) setData(toSession(session?.user ?? null));
      });
      return () => {
        active = false;
        sub.subscription.unsubscribe();
      };
    }, []);
    return { data, isPending };
  },
};

export const { signIn, signUp, signOut, useSession } = authClient;

export type SessionUser = AuthUser;
