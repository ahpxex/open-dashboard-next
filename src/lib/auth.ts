import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { type MemoryDB, memoryAdapter } from "better-auth/adapters/memory";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db, schema } from "@/db";
import { hasDatabase } from "@/lib/backend";

/**
 * better-auth's in-memory adapter needs an array per model and snapshots the
 * whole store with `structuredClone` for its transactions — so the store must be
 * a plain, cloneable object (a Proxy throws `DataCloneError`). Pre-create the
 * core model arrays; if you enable a better-auth plugin that adds its own models,
 * add their arrays here too.
 */
const memoryStore: MemoryDB = {
  user: [],
  session: [],
  account: [],
  verification: [],
};

/**
 * Pick the persistence adapter from the configured backend. With `DATABASE_URL`
 * set, sessions/users live in Postgres via Drizzle (production path). With no
 * database, better-auth's in-memory adapter keeps the login flow fully working
 * for zero-config `bun dev` — accounts reset on server restart, which is fine for
 * local development. Swap to a real backend by setting `DATABASE_URL`.
 */
const database = hasDatabase
  ? drizzleAdapter(db, { provider: "pg", usePlural: true, schema })
  : memoryAdapter(memoryStore);

/**
 * Session-signing secret. Required in production: fail closed rather than fall
 * back to a public, insecure value. The dev fallback only applies outside
 * production so zero-config `bun dev` still works.
 */
const secret =
  process.env.BETTER_AUTH_SECRET ??
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error(
          "BETTER_AUTH_SECRET must be set in production (generate one with `openssl rand -base64 32`).",
        );
      })()
    : "dev-only-insecure-secret-change-me");

export const auth = betterAuth({
  // Leave baseURL unset in zero-config dev: better-auth then derives the origin
  // from the request, so login works on whatever port `bun dev` lands on. Set
  // BETTER_AUTH_URL in production (and the secret fails closed there).
  baseURL: process.env.BETTER_AUTH_URL,
  secret,
  database,
  emailAndPassword: {
    enabled: true,
    // Flip to true once you wire a transactional email provider.
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  // tanstackStartCookies must be the LAST plugin so it can flush Set-Cookie.
  plugins: [tanstackStartCookies()],
});

/**
 * Zero-config dev convenience: in memory mode there is no `db:seed`, so the
 * account behind the login page's "Dev quick login" button (dev@example.com /
 * password) would not exist. Seed it once at startup so the button works out of
 * the box. Never runs with a real database or in production.
 */
if (!hasDatabase && process.env.NODE_ENV !== "production") {
  void auth.api
    .signUpEmail({
      body: {
        email: "dev@example.com",
        password: "password",
        name: "Dev User",
      },
    })
    .catch(() => {
      // Already seeded (e.g. on hot reload) — ignore.
    });
}
