/**
 * The Hono app — assembled separately from the server bootstrap (src/index.ts)
 * so the test suite can import and exercise it via `app.request(...)` without
 * binding a port.
 *
 * Wiring:
 *   POST /api/auth/register  → custom sign-up (CONTRACT §2c), mounted BEFORE the
 *                              Auth.js handler so it wins the path.
 *   /api/auth/*              → Auth.js v5 (CONTRACT §2c) — csrf / session /
 *                              callback/credentials / signout, CSRF + cookies.
 *   /products/*             → json-server-dialect REST (CONTRACT §1).
 *   /health                 → liveness probe.
 *
 * CORS is enabled for the frontend origin and exposes X-Total-Count so a browser
 * hitting this service directly works. In the default frontend wiring the
 * dashboard proxies server-side, so this is belt-and-suspenders.
 */
import { authHandler, initAuthConfig } from "@hono/auth-js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authConfig } from "./auth";
import { frontendOrigin } from "./lib/env";
import { productsRoutes } from "./products";
import { registerRoutes } from "./register";

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: frontendOrigin,
    credentials: true,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["X-Total-Count"],
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

// Provide the Auth.js config to every request. `@hono/auth-js` reads AUTH_SECRET
// / AUTH_URL from the env too, but we pass an explicit config so the Credentials
// provider + JWT callbacks are always in effect. `basePath` MUST be `/api/auth`:
// @auth/core defaults it to `/auth`, which wouldn't match where we mount the
// handler, so set it explicitly here.
app.use(
  "*",
  initAuthConfig(() => ({
    ...authConfig,
    basePath: "/api/auth",
  })),
);

// Custom sign-up — MUST be registered before the Auth.js catch-all so
// POST /api/auth/register isn't swallowed by the handler (Auth.js would 404 it).
app.route("/api/auth", registerRoutes);

// Auth.js owns every other method under /api/auth/* (csrf, session,
// callback/credentials, signout, ...).
app.use("/api/auth/*", authHandler());

app.route("/products", productsRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));
