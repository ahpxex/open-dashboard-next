/**
 * Contract verification (CONTRACT.md §4) against the real Hono app + real Auth.js
 * v5 + a real in-memory SQLite database (no transport mocks). Set up forces
 * SQLite `:memory:` and a dev secret before any module under test is imported.
 *
 * The auth half drives the *real* Auth.js CSRF + cookie flow exactly as the
 * frontend's remote-authjs auth-client does:
 *   GET  /api/auth/csrf                    -> { csrfToken } + a csrf cookie
 *   POST /api/auth/register                -> creates the bcrypt user
 *   POST /api/auth/callback/credentials    -> csrfToken + creds + csrf cookie,
 *                                             follows the Set-Cookie session token
 *   GET  /api/auth/session                 -> { user: { id, name, email } }
 */
import { beforeAll, describe, expect, test } from "bun:test";

process.env.DATABASE_URL = "";
process.env.SQLITE_PATH = ":memory:";
process.env.NODE_ENV = "test";
process.env.AUTH_SECRET ||= "test-secret-not-for-production";
process.env.FRONTEND_ORIGIN = "http://localhost:3000";
// The contract suite runs with the data-API guard OFF (zero-config). The guard
// reads DATA_API_TOKEN live per-request, so pin it empty before these tests run
// — deterministic regardless of test-file ordering or a token set by another
// file sharing this `bun test` process.
beforeAll(() => {
  process.env.DATA_API_TOKEN = "";
});

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
  return app.request(new Request(`http://localhost${path}`, init));
}

function jsonBody(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

/**
 * A tiny cookie jar: parse `Set-Cookie` (name=value) from a response and merge
 * into a `name=value; name2=value2` cookie header for the next request. Auth.js
 * sets the csrf cookie on /csrf and the session cookie on a successful callback,
 * and clears the session on signout (empty value) — this models the browser's
 * cookie store closely enough for the round-trip.
 */
class CookieJar {
  private jar = new Map<string, string>();

  absorb(res: Response): void {
    // Bun's Headers#getSetCookie returns each Set-Cookie separately.
    const cookies =
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : ([res.headers.get("set-cookie")].filter(Boolean) as string[]);
    for (const raw of cookies) {
      const first = raw.split(";")[0] ?? "";
      const eq = first.indexOf("=");
      if (eq === -1) continue;
      const name = first.slice(0, eq).trim();
      const value = first.slice(eq + 1).trim();
      if (!name) continue;
      if (value === "") this.jar.delete(name);
      else this.jar.set(name, value);
    }
  }

  header(): string {
    return [...this.jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  has(predicate: (name: string) => boolean): boolean {
    return [...this.jar.keys()].some(predicate);
  }
}

async function createProduct(
  overrides: Partial<Product> = {},
): Promise<Product> {
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

describe("auth (CONTRACT §2c + §4.1): register -> CSRF+callback -> session", () => {
  const email = `user-${Date.now()}@example.com`;
  const password = "password123";
  const jar = new CookieJar();
  let csrfToken = "";

  test("register creates a user (201)", async () => {
    const res = await req(
      "/api/auth/register",
      jsonBody({ email, password, name: "Round Trip" }),
    );
    expect(res.status).toBe(201);
    const data = (await res.json()) as { user?: { email?: string } };
    expect(data.user?.email).toBe(email);
  });

  test("register a duplicate email -> 409", async () => {
    const res = await req(
      "/api/auth/register",
      jsonBody({ email, password, name: "Dup" }),
    );
    expect(res.status).toBe(409);
  });

  test("register with a bad body -> 400", async () => {
    const res = await req(
      "/api/auth/register",
      jsonBody({ email: "not-an-email", password: "short" }),
    );
    expect(res.status).toBe(400);
  });

  test("GET /api/auth/csrf returns a token and sets a csrf cookie", async () => {
    const res = await req("/api/auth/csrf");
    expect(res.status).toBe(200);
    const data = (await res.json()) as { csrfToken?: string };
    expect(data.csrfToken).toBeTruthy();
    csrfToken = data.csrfToken ?? "";
    jar.absorb(res);
    expect(jar.has((n) => n.toLowerCase().includes("csrf-token"))).toBe(true);
  });

  test("POST /callback/credentials with csrf + creds signs in", async () => {
    const res = await req("/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        cookie: jar.header(),
      },
      body: new URLSearchParams({
        csrfToken,
        email,
        password,
        // Auth.js redirects by default; the contract's auth-client posts JSON-less
        // form data. We follow the Set-Cookie regardless of the response code.
        callbackUrl: "http://localhost:3000",
      }).toString(),
      redirect: "manual",
    });
    // A credentials callback returns 302 (redirect) on success; the important
    // thing is the session cookie is set.
    expect([200, 302]).toContain(res.status);
    jar.absorb(res);
    expect(jar.has((n) => n.toLowerCase().includes("session-token"))).toBe(
      true,
    );
  });

  test("GET /api/auth/session round-trips the user with an id", async () => {
    const res = await req("/api/auth/session", {
      headers: { cookie: jar.header() },
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      user?: { id?: string; email?: string; name?: string };
    };
    expect(data.user?.email).toBe(email);
    expect(data.user?.name).toBe("Round Trip");
    expect(typeof data.user?.id).toBe("string");
    expect((data.user?.id ?? "").length).toBeGreaterThan(0);
  });

  test("GET /api/auth/session without a cookie is unauthenticated", async () => {
    const res = await req("/api/auth/session");
    expect(res.status).toBe(200);
    // Auth.js returns `null` (or `{}`) for no session.
    const data = (await res.json().catch(() => null)) as {
      user?: unknown;
    } | null;
    expect(data == null || data.user == null).toBe(true);
  });

  test("sign-in with a wrong password does not set a session", async () => {
    const freshJar = new CookieJar();
    const csrfRes = await req("/api/auth/csrf");
    freshJar.absorb(csrfRes);
    const token = ((await csrfRes.json()) as { csrfToken: string }).csrfToken;

    const res = await req("/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        cookie: freshJar.header(),
      },
      body: new URLSearchParams({
        csrfToken: token,
        email,
        password: "wrong-password",
      }).toString(),
      redirect: "manual",
    });
    freshJar.absorb(res);
    // No session token issued for a failed credential check.
    expect(freshJar.has((n) => n.toLowerCase().includes("session-token"))).toBe(
      false,
    );
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
});
