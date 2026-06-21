/**
 * `products` REST routes in the json-server dialect (CONTRACT.md §1), backed by
 * Prisma. Mounted at `/products` by src/app.ts.
 *
 *   GET    /products        list  (_page/_limit/_sort/_order/q/status + X-Total-Count)
 *   GET    /products/:id    read one (404 when absent)
 *   POST   /products        create (201)
 *   PATCH  /products/:id     update (404 when absent)
 *   DELETE /products/:id     delete (204, 404 when absent)
 */
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { Hono } from "hono";
import { prisma } from "./db";
import { dataApiToken } from "./lib/env";
import {
  type Product,
  isValidStatus,
  productInputSchema,
  productPatchSchema,
  resolveOrder,
  resolveSort,
  SEARCHABLE,
  type SortField,
} from "./lib/products-schema";

/** Largest page size the list endpoint will honor (matches the frontend posture). */
const MAX_LIMIT = 100;

/**
 * Escape LIKE wildcards (`%`, `_`) and the backslash escape char itself in a raw
 * search term so user-typed `%`/`_` match literally instead of acting as
 * wildcards. Pairs with the explicit `ESCAPE '\'` on the generated LIKE.
 *
 * NOTE: we build the search `LIKE … ESCAPE '\'` by hand (raw SQL) rather than via
 * Prisma's `contains`, because the SQLite connector emits a bare `LIKE` with no
 * `ESCAPE` clause — so backslash-escaping a `contains` value would match a
 * literal backslash there. The raw `ESCAPE '\'` form behaves identically on
 * SQLite and Postgres, matching the Drizzle sibling.
 */
function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, "\\$&");
}

/** Physical column for a whitelisted sort field (quoted, safe to interpolate). */
function sortColumn(field: SortField): Prisma.Sql {
  // `field` is already constrained to the SORTABLE whitelist by resolveSort.
  return Prisma.raw(`"${field}"`);
}

/**
 * Coerce a Prisma date column to an ISO-8601 string. Typed Prisma model rows
 * give a `Date`; raw (`$queryRaw`) rows give a `Date` on Postgres but a string on
 * SQLite — normalise both to the contract's ISO string.
 */
function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/**
 * Normalise a product row (typed Prisma model OR raw `$queryRaw`) to the
 * contract's Product shape (ISO-8601 dates).
 */
function toProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    sku: String(row.sku),
    category: String(row.category),
    price: Number(row.price),
    stock: Number(row.stock),
    status: row.status as Product["status"],
    description: row.description == null ? "" : String(row.description),
    createdAt: toIso(row.createdAt as Date | string),
    updatedAt: toIso(row.updatedAt as Date | string),
  };
}

export const productsRoutes = new Hono();

// Optional bearer guard (CONTRACT §1): when DATA_API_TOKEN is set, every data
// route requires `Authorization: Bearer <DATA_API_TOKEN>`. Unset => open (the
// trusted server-to-server posture; zero-config dev keeps working).
productsRoutes.use("*", async (c, next) => {
  if (!dataApiToken) return next();
  const header = c.req.header("authorization") ?? "";
  const expected = `Bearer ${dataApiToken}`;
  if (header !== expected) {
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
      ? Math.min(Math.floor(limitRaw), MAX_LIMIT)
      : 10;
  const skip = (page - 1) * limit;

  // Build the WHERE as composable, fully-parameterised SQL fragments so the
  // search term + status value are never string-interpolated. The only literals
  // we interpolate are the whitelisted sort column/order and the numeric
  // limit/offset. This raw form lets us attach an explicit `ESCAPE '\'` to the
  // search LIKE (Prisma's own `contains` omits it on SQLite), so user-typed
  // `%`/`_` match literally — identical behavior on SQLite and Postgres.
  const conditions: Prisma.Sql[] = [];

  if (q) {
    const needle = `%${escapeLike(q.toLowerCase())}%`;
    const ors = SEARCHABLE.map(
      // `\\` in source => a single literal backslash in the SQL `ESCAPE '\'`.
      (col) => Prisma.sql`lower("${Prisma.raw(col)}") LIKE ${needle} ESCAPE '\\'`,
    );
    conditions.push(Prisma.sql`(${Prisma.join(ors, " OR ")})`);
  }

  // Exact-match status filter — only honored when it's a known enum value;
  // unknown filter values are ignored (return everything) per the contract's
  // "unknown filter keys are ignored" + whitelist posture.
  if (statusRaw && isValidStatus(statusRaw)) {
    conditions.push(Prisma.sql`"status" = ${statusRaw}`);
  }

  const whereSql = conditions.length
    ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
    : Prisma.empty;
  const orderSql = Prisma.raw(order === "asc" ? "ASC" : "DESC");

  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<Record<string, unknown>[]>(
      Prisma.sql`SELECT * FROM "products" ${whereSql} ORDER BY ${sortColumn(sortField)} ${orderSql} LIMIT ${limit} OFFSET ${skip}`,
    ),
    prisma.$queryRaw<{ count: bigint | number }[]>(
      Prisma.sql`SELECT COUNT(*) AS count FROM "products" ${whereSql}`,
    ),
  ]);
  const total = Number(countRows[0]?.count ?? 0);

  // X-Total-Count is exposed to the browser by the cors() middleware
  // (exposeHeaders) in src/app.ts — no need to set the header here.
  c.header("X-Total-Count", String(total));
  return c.json(rows.map(toProduct));
});

// GET /products/:id — read one.
productsRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const row = await prisma.product.findUnique({ where: { id } });
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

  const row = await prisma.product.create({
    data: {
      id: randomUUID(),
      ...parsed.data,
      description: parsed.data.description ?? "",
    },
  });
  return c.json(toProduct(row), 201);
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

  // Reject an effectively-empty patch (no updatable fields) — a no-op write that
  // would still bump `updatedAt` is almost always a client bug, not intent.
  if (Object.keys(parsed.data).length === 0) {
    return c.json({ error: "No updatable fields provided" }, 400);
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  const row = await prisma.product.update({
    where: { id },
    // `updatedAt` is bumped automatically by Prisma's @updatedAt.
    data: parsed.data,
  });
  return c.json(toProduct(row));
});

// DELETE /products/:id — delete.
productsRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  await prisma.product.delete({ where: { id } });
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
