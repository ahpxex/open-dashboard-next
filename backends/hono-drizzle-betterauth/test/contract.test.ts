/**
 * Contract verification (CONTRACT.md §4) against the real Hono app + a real
 * in-memory SQLite database (no transport mocks). Set up forces SQLite
 * `:memory:` and a dev secret before any module under test is imported.
 */
import { beforeAll, describe, expect, test } from "bun:test";

process.env.DATABASE_URL = "";
process.env.SQLITE_PATH = ":memory:";
process.env.NODE_ENV = "test";
process.env.BETTER_AUTH_SECRET ||= "test-secret-not-for-production";
process.env.FRONTEND_ORIGIN = "http://localhost:3000";

// Imported lazily after env is set so the db client picks SQLite :memory:.
const { app } = await import("../src/app");

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

function req(path: string, init?: RequestInit) {
  return app.request(
    new Request(`http://localhost${path}`, init),
  );
}

function jsonBody(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

async function createProduct(overrides: Partial<Product> = {}): Promise<Product> {
  const res = await req("/products", {
    ...jsonBody({
      name: "Test Widget",
      sku: `SKU-${Math.random().toString(36).slice(2, 8)}`,
      category: "Widgets",
      price: 9.99,
      stock: 5,
      status: "available",
      description: "",
      ...overrides,
    }),
  });
  expect(res.status).toBe(201);
  return (await res.json()) as Product;
}

describe("auth (CONTRACT §2b + §4.1): register -> login -> get-session", () => {
  const email = `user-${Date.now()}@example.com`;
  const password = "password123";
  let sessionCookie = "";

  test("sign-up returns a session cookie", async () => {
    const res = await req(
      "/api/auth/sign-up/email",
      jsonBody({ email, password, name: "Round Trip" }),
    );
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    sessionCookie = (setCookie ?? "").split(";")[0] ?? "";
    expect(sessionCookie).toContain("better-auth");
  });

  test("sign-in with the same credentials succeeds", async () => {
    const res = await req(
      "/api/auth/sign-in/email",
      jsonBody({ email, password }),
    );
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    sessionCookie = (setCookie ?? "").split(";")[0] ?? "";
  });

  test("get-session round-trips the user", async () => {
    const res = await req("/api/auth/get-session", {
      headers: { cookie: sessionCookie },
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { user?: { email?: string } } | null;
    expect(data?.user?.email).toBe(email);
  });

  test("get-session without a cookie is unauthenticated", async () => {
    const res = await req("/api/auth/get-session");
    // better-auth returns 200 with null body for no session.
    const data = (await res
      .json()
      .catch(() => null)) as { user?: unknown } | null;
    expect(data == null || data.user == null).toBe(true);
  });

  test("sign-in with a wrong password is rejected", async () => {
    const res = await req(
      "/api/auth/sign-in/email",
      jsonBody({ email, password: "wrong-password" }),
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe("products data API (CONTRACT §1 + §4)", () => {
  test("§4.2 create then list returns the row with correct X-Total-Count", async () => {
    const created = await createProduct({ name: "Listable", category: "Alpha" });

    const res = await req("/products?_page=1&_limit=10");
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Total-Count")).toBeTruthy();
    const total = Number(res.headers.get("X-Total-Count"));
    expect(total).toBeGreaterThanOrEqual(1);

    const rows = (await res.json()) as Product[];
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.some((r) => r.id === created.id)).toBe(true);
  });

  test("§4.3 search (q) matches name/sku/category, case-insensitively", async () => {
    const uniq = `Zephyr${Date.now()}`;
    await createProduct({ name: uniq, category: "SearchCat" });

    const res = await req(`/products?q=${uniq.toLowerCase()}`);
    expect(res.status).toBe(200);
    const rows = (await res.json()) as Product[];
    expect(rows.length).toBe(1);
    expect(rows[0]?.name).toBe(uniq);
    expect(Number(res.headers.get("X-Total-Count"))).toBe(1);
  });

  test("§4.3 filter (status) is exact-match", async () => {
    const tag = `Filt${Date.now()}`;
    await createProduct({ name: `${tag}-a`, status: "available" });
    await createProduct({ name: `${tag}-b`, status: "discontinued" });

    const res = await req(`/products?q=${tag}&status=discontinued`);
    const rows = (await res.json()) as Product[];
    expect(rows.length).toBe(1);
    expect(rows[0]?.status).toBe("discontinued");
  });

  test("§4.3 sort (_sort/_order) honors the whitelist + falls back", async () => {
    const tag = `Sort${Date.now()}`;
    await createProduct({ name: `${tag}-1`, price: 300 });
    await createProduct({ name: `${tag}-2`, price: 100 });
    await createProduct({ name: `${tag}-3`, price: 200 });

    const asc = (await (
      await req(`/products?q=${tag}&_sort=price&_order=asc`)
    ).json()) as Product[];
    expect(asc.map((p) => p.price)).toEqual([100, 200, 300]);

    const desc = (await (
      await req(`/products?q=${tag}&_sort=price&_order=desc`)
    ).json()) as Product[];
    expect(desc.map((p) => p.price)).toEqual([300, 200, 100]);

    // Unknown sort field -> default sort (createdAt desc), no error.
    const fallback = await req(`/products?q=${tag}&_sort=evil; DROP TABLE`);
    expect(fallback.status).toBe(200);
  });

  test("§4.3 pagination slices the filtered set", async () => {
    const tag = `Page${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      await createProduct({ name: `${tag}-${i}`, category: tag });
    }

    const page1 = await req(`/products?q=${tag}&_page=1&_limit=2`);
    const rows1 = (await page1.json()) as Product[];
    expect(rows1.length).toBe(2);
    expect(Number(page1.headers.get("X-Total-Count"))).toBe(5);

    const page3 = await req(`/products?q=${tag}&_page=3&_limit=2`);
    const rows3 = (await page3.json()) as Product[];
    expect(rows3.length).toBe(1);
  });

  test("§4.4 patch then get reflects the change", async () => {
    const created = await createProduct({ name: "Before", stock: 1 });

    const patch = await req(`/products/${created.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "After", stock: 99 }),
    });
    expect(patch.status).toBe(200);
    const patched = (await patch.json()) as Product;
    expect(patched.name).toBe("After");
    expect(patched.stock).toBe(99);

    const got = (await (await req(`/products/${created.id}`)).json()) as Product;
    expect(got.name).toBe("After");
    expect(got.stock).toBe(99);
    expect(got.updatedAt >= created.updatedAt).toBe(true);
  });

  test("§4.4 delete then get -> 404", async () => {
    const created = await createProduct({ name: "Doomed" });

    const del = await req(`/products/${created.id}`, { method: "DELETE" });
    expect([200, 204]).toContain(del.status);

    const got = await req(`/products/${created.id}`);
    expect(got.status).toBe(404);
  });

  test("read one for an unknown id -> 404", async () => {
    const res = await req("/products/does-not-exist");
    expect(res.status).toBe(404);
  });

  test("create with invalid body -> 400", async () => {
    const res = await req("/products", jsonBody({ name: "" }));
    expect(res.status).toBe(400);
  });

  test("create rejects an unknown status enum -> 400", async () => {
    const res = await req(
      "/products",
      jsonBody({
        name: "Bad",
        sku: "X",
        category: "Y",
        price: 1,
        stock: 1,
        status: "on_fire",
      }),
    );
    expect(res.status).toBe(400);
  });

  test("search treats LIKE wildcards (%, _) as literal characters", async () => {
    const stamp = Date.now();
    // A name containing a literal `%`, and a sibling that a raw `%` wildcard
    // would also match if the term weren't escaped.
    const withPercent = `Lit%Match${stamp}`;
    const sibling = `LitXMatch${stamp}`;
    await createProduct({ name: withPercent, category: `Esc${stamp}` });
    await createProduct({ name: sibling, category: `Esc${stamp}` });

    // Searching for the literal `Lit%Match…` must return only the `%` row, not
    // the sibling (which it would, if `%` were a wildcard meaning "any chars").
    const res = await req(`/products?q=${encodeURIComponent(withPercent)}`);
    expect(res.status).toBe(200);
    const rows = (await res.json()) as Product[];
    expect(rows.length).toBe(1);
    expect(rows[0]?.name).toBe(withPercent);

    // A literal `_` likewise matches only itself, not "any single char".
    const withUnderscore = `Und_score${stamp}`;
    const underscoreSibling = `UndXscore${stamp}`;
    await createProduct({ name: withUnderscore, category: `Esc${stamp}` });
    await createProduct({ name: underscoreSibling, category: `Esc${stamp}` });

    const res2 = await req(`/products?q=${encodeURIComponent(withUnderscore)}`);
    const rows2 = (await res2.json()) as Product[];
    expect(rows2.length).toBe(1);
    expect(rows2[0]?.name).toBe(withUnderscore);
  });

  test("_limit is capped at 100", async () => {
    const tag = `Cap${Date.now()}`;
    // Create more than 100 rows so an uncapped limit would return >100.
    const makers: Promise<Product>[] = [];
    for (let i = 0; i < 101; i++) {
      makers.push(createProduct({ name: `${tag}-${i}`, category: tag }));
    }
    await Promise.all(makers);

    const res = await req(`/products?q=${tag}&_limit=1000`);
    expect(res.status).toBe(200);
    const rows = (await res.json()) as Product[];
    expect(rows.length).toBe(100);
    // The total still reflects the full filtered set.
    expect(Number(res.headers.get("X-Total-Count"))).toBe(101);
  });

  test("patch with a partial body (one real field) still works", async () => {
    const created = await createProduct({ name: "PartialBefore", stock: 1 });
    const patch = await req(`/products/${created.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stock: 7 }),
    });
    expect(patch.status).toBe(200);
    const patched = (await patch.json()) as Product;
    expect(patched.stock).toBe(7);
    expect(patched.name).toBe("PartialBefore");
  });

  test("patch with an effectively-empty body -> 400 (no no-op updatedAt bump)", async () => {
    const created = await createProduct({ name: "Untouched" });

    const res = await req(`/products/${created.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);

    // updatedAt must be unchanged (no silent write happened).
    const got = (await (await req(`/products/${created.id}`)).json()) as Product;
    expect(got.updatedAt).toBe(created.updatedAt);
  });
});
