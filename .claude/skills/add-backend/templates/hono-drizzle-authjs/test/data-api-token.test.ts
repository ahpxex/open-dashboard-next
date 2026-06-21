/**
 * Optional data-API bearer guard (CONTRACT §1). Proves that when DATA_API_TOKEN
 * is set, the /products routes require `Authorization: Bearer <token>`:
 *   - no bearer            -> 401 { error: "Unauthorized" }
 *   - wrong bearer         -> 401
 *   - correct bearer       -> succeeds (200)
 * The auth routes (/api/auth/*) are NOT gated.
 *
 * This lives in its own test file so it can set DATA_API_TOKEN in the env BEFORE
 * the app module graph is imported — the guard is wired at app-construction time.
 * The main contract suite (test/contract.test.ts) runs with NO token set and is
 * unaffected; Bun evaluates each test file's module graph in isolation.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";

const DATA_API_TOKEN = "test-data-token-abc123";

process.env.DATABASE_URL = "";
process.env.SQLITE_PATH = ":memory:";
process.env.NODE_ENV = "test";
process.env.AUTH_SECRET ||= "test-secret-not-for-production";
process.env.FRONTEND_ORIGIN = "http://localhost:3000";

// The guard reads DATA_API_TOKEN live per-request, so set it for this file's
// tests and clear it afterward — `process.env` is shared across the whole
// `bun test` process, but Bun runs each test file's cases to completion before
// the next file's, so per-file set/restore keeps the contract suite unaffected.
beforeAll(() => {
  process.env.DATA_API_TOKEN = DATA_API_TOKEN;
});
afterAll(() => {
  process.env.DATA_API_TOKEN = "";
});

const { app } = await import("../src/app");

function req(path: string, init?: RequestInit) {
  return app.request(new Request(`http://localhost${path}`, init));
}

const validProduct = {
  name: "Guarded Widget",
  sku: "GUARD-1",
  category: "Widgets",
  price: 9.99,
  stock: 5,
  status: "available",
  description: "",
};

describe("data-API bearer guard (CONTRACT §1, DATA_API_TOKEN set)", () => {
  test("GET /products without a bearer -> 401", async () => {
    const res = await req("/products");
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("Unauthorized");
  });

  test("GET /products with the wrong bearer -> 401", async () => {
    const res = await req("/products", {
      headers: { Authorization: "Bearer not-the-token" },
    });
    expect(res.status).toBe(401);
  });

  test("POST /products without a bearer -> 401 (writes are gated too)", async () => {
    const res = await req("/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validProduct),
    });
    expect(res.status).toBe(401);
  });

  test("GET /products WITH the correct bearer succeeds (200)", async () => {
    const res = await req("/products", {
      headers: { Authorization: `Bearer ${DATA_API_TOKEN}` },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Total-Count")).toBeTruthy();
    const rows = await res.json();
    expect(Array.isArray(rows)).toBe(true);
  });

  test("an item route (/products/:id) is gated too", async () => {
    const res = await req("/products/does-not-exist");
    expect(res.status).toBe(401);

    const ok = await req("/products/does-not-exist", {
      headers: { Authorization: `Bearer ${DATA_API_TOKEN}` },
    });
    // Authorized but missing row -> the normal 404, not 401.
    expect(ok.status).toBe(404);
  });

  test("auth routes are NOT gated by DATA_API_TOKEN", async () => {
    // /api/auth/csrf needs no data bearer — it runs the Auth.js flow.
    const res = await req("/api/auth/csrf");
    expect(res.status).toBe(200);
    const data = (await res.json()) as { csrfToken?: string };
    expect(data.csrfToken).toBeTruthy();
  });
});
