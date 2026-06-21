/**
 * `products` REST routes in the json-server dialect (CONTRACT.md §1), backed by
 * Drizzle. Mounted at `/products` by src/index.ts.
 *
 *   GET    /products        list  (_page/_limit/_sort/_order/q/status + X-Total-Count)
 *   GET    /products/:id    read one (404 when absent)
 *   POST   /products        create (201)
 *   PATCH  /products/:id     update (404 when absent)
 *   DELETE /products/:id     delete (204, 404 when absent)
 */
import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db, schema } from "./db";
import { getDataApiToken } from "./lib/env";
import {
  type Product,
  type ProductStatus,
  isValidStatus,
  productInputSchema,
  productPatchSchema,
  resolveOrder,
  resolveSort,
  SEARCHABLE,
} from "./lib/products-schema";

const products = schema.products;

/** Largest page size the list endpoint will honor (matches the frontend posture). */
const MAX_LIMIT = 100;

/**
 * Escape LIKE wildcards (`%`, `_`) and the escape char itself in a raw search
 * term so user-typed `%`/`_` match literally instead of acting as wildcards.
 * Pairs with the `ESCAPE '\'` clause on the generated LIKE.
 */
function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, "\\$&");
}

/** Normalise a raw DB row to the contract's Product shape. */
function toProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    sku: String(row.sku),
    category: String(row.category),
    price: Number(row.price),
    stock: Number(row.stock),
    status: row.status as ProductStatus,
    description: row.description == null ? "" : String(row.description),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export const productsRoutes = new Hono();

// Optional bearer guard (CONTRACT §1): when DATA_API_TOKEN is set, every data
// route requires `Authorization: Bearer <DATA_API_TOKEN>`. Unset => open (the
// trusted server-to-server posture; zero-config dev keeps working).
productsRoutes.use("*", async (c, next) => {
  const token = getDataApiToken();
  if (!token) return next();
  const header = c.req.header("authorization") ?? "";
  if (header !== `Bearer ${token}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
});

// GET /products — filtered + sorted + paginated list with X-Total-Count.
productsRoutes.get("/", async (c) => {
  const url = new URL(c.req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const statusRaw = url.searchParams.get("status")?.trim() || "";
  const sortField = resolveSort(url.searchParams.get("_sort") ?? undefined);
  const order = resolveOrder(url.searchParams.get("_order") ?? undefined);

  const page = Math.max(1, Number(url.searchParams.get("_page")) || 1);
  const limitRaw = Number(url.searchParams.get("_limit"));
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(MAX_LIMIT, Math.floor(limitRaw))
      : 10;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (q) {
    // Escape LIKE wildcards so a user-typed `%`/`_` matches literally.
    const needle = `%${escapeLike(q.toLowerCase())}%`;
    conditions.push(
      or(
        ...SEARCHABLE.map((col) =>
          like(sql`lower(${products[col]})`, sql`${needle} ESCAPE '\\'`),
        ),
      ),
    );
  }

  // Exact-match status filter — only honored when it's a known enum value;
  // unknown filter values are ignored (return everything) per the contract's
  // "unknown filter keys are ignored" + whitelist posture.
  if (statusRaw && isValidStatus(statusRaw)) {
    conditions.push(eq(products.status, statusRaw));
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const orderBy = order === "asc"
    ? asc(products[sortField])
    : desc(products[sortField]);

  const rows = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const countRows = await db
    .select({ value: sql<number>`count(*)` })
    .from(products)
    .where(where);
  const total = Number(countRows[0]?.value ?? 0);

  c.header("X-Total-Count", String(total));
  c.header("Access-Control-Expose-Headers", "X-Total-Count");
  return c.json(rows.map(toProduct));
});

// GET /products/:id — read one.
productsRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(toProduct(row));
});

// POST /products — create.
productsRoutes.post("/", async (c) => {
  const body = await readJson(c);
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      400,
    );
  }

  const now = new Date().toISOString();
  const record = {
    id: randomUUID(),
    ...parsed.data,
    description: parsed.data.description ?? "",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(products).values(record);
  return c.json(toProduct(record), 201);
});

// PATCH /products/:id — partial update.
productsRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await readJson(c);
  const parsed = productPatchSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      400,
    );
  }

  // Reject an effectively-empty patch (no updatable fields) rather than
  // silently bumping updatedAt with a no-op write.
  if (Object.keys(parsed.data).length === 0) {
    return c.json(
      { error: "Validation failed", details: "No updatable fields provided" },
      400,
    );
  }

  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (!existing[0]) return c.json({ error: "Not found" }, 404);

  const updates = { ...parsed.data, updatedAt: new Date().toISOString() };
  await db.update(products).set(updates).where(eq(products.id, id));

  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return c.json(toProduct(rows[0]));
});

// DELETE /products/:id — delete.
productsRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (!existing[0]) return c.json({ error: "Not found" }, 404);

  await db.delete(products).where(eq(products.id, id));
  return c.body(null, 204);
});

/** Tolerant JSON body reader — an empty/invalid body becomes `{}`. */
async function readJson(c: { req: { json: () => Promise<unknown> } }) {
  try {
    return await c.req.json();
  } catch {
    return {};
  }
}
