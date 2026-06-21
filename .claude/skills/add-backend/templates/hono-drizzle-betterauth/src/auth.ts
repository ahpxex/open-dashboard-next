/**
 * Real better-auth (email + password, Drizzle adapter) hosted at /api/auth/* —
 * CONTRACT.md §2b. This is the same SDK the in-process default uses, just on a
 * standalone origin, so the frontend wiring is a thin remote adapter
 * (createAuthClient({ baseURL }) + a get-session/handler proxy), not a
 * re-implementation.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, dialect, schema } from "./db";
import { authBaseUrl, authSecret, frontendOrigin } from "./lib/env";

export const auth = betterAuth({
  // Set BETTER_AUTH_URL in production; in dev better-auth derives the origin from
  // the request so it works on whatever port the service lands on.
  baseURL: authBaseUrl,
  secret: authSecret,
  database: drizzleAdapter(db, {
    provider: dialect === "pg" ? "pg" : "sqlite",
    // Singular table names (user/session/account/verification) — matches the
    // hand-authored schema in src/db/schema.*.ts.
    usePlural: false,
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
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
