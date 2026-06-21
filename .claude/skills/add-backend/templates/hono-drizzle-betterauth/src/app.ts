/**
 * The Hono app — assembled separately from the server bootstrap (src/index.ts)
 * so the test suite can import and exercise it via `app.request(...)` without
 * binding a port.
 *
 * Wiring:
 *   /api/auth/*  → real better-auth (CONTRACT.md §2b), cookie-based.
 *   /products/*  → json-server-dialect REST (CONTRACT.md §1).
 *   /health      → liveness probe.
 *
 * CORS is enabled for the frontend origin and exposes X-Total-Count so a browser
 * hitting this service directly (the remote auth-client + any direct data call)
 * works. In the default frontend wiring the dashboard proxies server-side, so
 * this is belt-and-suspenders.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { frontendOrigin } from "./lib/env";
import { productsRoutes } from "./products";

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

// better-auth owns every method under /api/auth/*.
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/products", productsRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));
