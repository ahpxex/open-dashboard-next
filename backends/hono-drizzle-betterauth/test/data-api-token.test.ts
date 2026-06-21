/**
 * Proves the optional DATA_API_TOKEN bearer guard on the data API (CONTRACT §1:
 * "A preset MAY additionally require a bearer token on data routes").
 *
 * The guard reads DATA_API_TOKEN live from the environment, so this test sets it
 * for the duration of the test only and restores it in `finally` — the rest of
 * the suite (test/contract.test.ts) keeps running with no token set, exercising
 * the zero-config open path, regardless of file execution order.
 */
import { describe, expect, test } from "bun:test";

process.env.DATABASE_URL = "";
process.env.SQLITE_PATH = ":memory:";
process.env.NODE_ENV = "test";
process.env.BETTER_AUTH_SECRET ||= "test-secret-not-for-production";
process.env.FRONTEND_ORIGIN = "http://localhost:3000";

const { app } = await import("../src/app");

function req(path: string, init?: RequestInit) {
  return app.request(new Request(`http://localhost${path}`, init));
}

const validProduct = {
  name: "Guarded Widget",
  sku: "GRD-001",
  category: "Widgets",
  price: 9.99,
  stock: 5,
  status: "available",
  description: "",
};

describe("data API bearer guard (CONTRACT §1, DATA_API_TOKEN set)", () => {
  test("a data request without the bearer => 401; with the correct bearer => succeeds", async () => {
    const TOKEN = "test-data-token-abc123";
    const previous = process.env.DATA_API_TOKEN;
    process.env.DATA_API_TOKEN = TOKEN;
    try {
      // No Authorization header => 401 with the JSON error shape.
      const noAuth = await req("/products");
      expect(noAuth.status).toBe(401);
      expect((await noAuth.json()) as { error?: string }).toEqual({
        error: "Unauthorized",
      });

      // Wrong token => 401.
      const wrong = await req("/products", {
        headers: { authorization: "Bearer not-the-token" },
      });
      expect(wrong.status).toBe(401);

      // Correct bearer => the list endpoint succeeds.
      const ok = await req("/products", {
        headers: { authorization: `Bearer ${TOKEN}` },
      });
      expect(ok.status).toBe(200);
      expect(Array.isArray(await ok.json())).toBe(true);

      // The guard also covers writes: create without the bearer => 401, with it => 201.
      const createNoAuth = await req("/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validProduct),
      });
      expect(createNoAuth.status).toBe(401);

      const createOk = await req("/products", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(validProduct),
      });
      expect(createOk.status).toBe(201);

      // Auth routes are NOT gated by the data token (no bearer, still reachable).
      const session = await req("/api/auth/get-session");
      expect(session.status).not.toBe(401);
    } finally {
      if (previous === undefined) delete process.env.DATA_API_TOKEN;
      else process.env.DATA_API_TOKEN = previous;
    }
  });
});
