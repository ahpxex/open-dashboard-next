/**
 * Auth.js (NextAuth) v5 configuration — CONTRACT.md §2c. Hosted at /api/auth/*
 * by `@hono/auth-js`'s `authHandler` (wired in src/app.ts), with a **Credentials**
 * provider that verifies email + password against the Drizzle `users` table
 * (bcrypt). The session strategy MUST be `jwt` — the Credentials provider does
 * not support database sessions.
 *
 * The standard Auth.js endpoints (`/api/auth/csrf`, `/session`,
 * `/callback/credentials`, `/signout`) all come from the handler; sign-up is the
 * one thing Auth.js has no endpoint for, so it lives in src/register.ts.
 *
 * Stable user id: the Credentials `authorize` returns a user whose `id` is the
 * Drizzle row id. We persist it onto the JWT in the `jwt` callback and re-expose
 * it on the session in the `session` callback, so `GET /api/auth/session`
 * returns `{ user: { id, name, email } }`.
 */
import Credentials from "@auth/core/providers/credentials";
import type { AuthConfig } from "@hono/auth-js";
import { authSecret } from "./lib/env";
import { verifyCredentials } from "./lib/users";

export const authConfig: AuthConfig = {
  secret: authSecret,
  // Not on Vercel — trust the Host header so Auth.js derives its own origin /
  // builds correct callback + CSRF URLs on whatever port the service lands on.
  trustHost: true,
  // Credentials → JWT sessions are mandatory (no DB session rows).
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 /* 7 days */ },
  providers: [
    Credentials({
      // The default sign-in form fields; the contract drives this over
      // `POST /api/auth/callback/credentials` with `email` + `password`.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const email = typeof raw?.email === "string" ? raw.email : "";
        const password = typeof raw?.password === "string" ? raw.password : "";
        if (!email || !password) return null;
        // verifyCredentials returns null on unknown email / wrong password,
        // which Auth.js surfaces as a rejected sign-in.
        return await verifyCredentials(email, password);
      },
    }),
  ],
  callbacks: {
    // First call (just after authorize) carries `user`; persist the stable id +
    // name onto the token. Later calls only have `token`.
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id ?? token.sub;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
      }
      return token;
    },
    // Surface the id (and name/email) from the token onto the session so the
    // frontend's getSession receives `{ user: { id, name, email } }`.
    async session({ session, token }) {
      if (session.user) {
        session.user.id =
          (token.id as string | undefined) ?? (token.sub as string) ?? "";
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.email === "string") session.user.email = token.email;
      }
      return session;
    },
  },
};
