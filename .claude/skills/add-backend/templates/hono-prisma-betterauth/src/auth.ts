/**
 * Real better-auth (email + password, Prisma adapter) hosted at /api/auth/* —
 * CONTRACT.md §2b. Same SDK + same protocol as the in-process default and the
 * Drizzle sibling; only the adapter differs (Prisma instead of Drizzle), so the
 * frontend wiring is the *identical* thin remote adapter
 * (createAuthClient({ baseURL }) + a get-session/handler proxy).
 */
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { authBaseUrl, authSecret, dialect, frontendOrigin } from "./lib/env";

export const auth = betterAuth({
  // Set BETTER_AUTH_URL in production; in dev better-auth derives the origin from
  // the request so it works on whatever port the service lands on.
  baseURL: authBaseUrl,
  secret: authSecret,
  database: prismaAdapter(prisma, {
    provider: dialect === "pg" ? "postgresql" : "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  // The frontend origin is trusted for CORS + CSRF. The proxy hop in the
  // frontend's AuthProvider.handler still forwards cookies, but listing the
  // origin here keeps direct browser calls (the remote auth-client) working.
  trustedOrigins: [frontendOrigin],
});
