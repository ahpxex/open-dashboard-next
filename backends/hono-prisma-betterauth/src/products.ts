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
import { Hono } from "hono";
import { dialect, prisma } from "./db";
import {
  type Product,
  isValidStatus,
  productInputSchema,
  productPatchSchema,
  resolveOrder,
  resolveSort,
  SEARCHABLE,
} from "./lib/products-schema";

/** Normalise a Prisma row to the contract's Product shape (ISO-8601 dates). */
function toProduct(row: {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    price: Number(row.price),
    stock: Number(row.stock),
    status: row.status as Product["status"],
    description: row.description ?? "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Case-insensitive `contains` clause for a column. Postgres needs an explicit
 * `mode: "insensitive"`; SQLite's `LIKE` is already case-insensitive for ASCII,
 * and passing `mode` to it is unsupported — so we branch on the dialect.
 */
function containsClause(value: string) {
  return dialect === "pg"
    ? { contains: value, mode: "insensitive" as const }
    : { contains: value };
}

export const productsRoutes = new Hono();

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
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 10;
  const skip = (page - 1) * limit;

  // biome-ignore lint/suspicious/noExplicitAny: Prisma's generated where-input type isn't imported here.
  const where: Record<string, any> = {};

  if (q) {
    where.OR = SEARCHABLE.map((col) => ({ [col]: containsClause(q) }));
  }

  // Exact-match status filter — only honored when it's a known enum value;
  // unknown filter values are ignored (return everything) per the contract's
  // "unknown filter keys are ignored" + whitelist posture.
  if (statusRaw && isValidStatus(statusRaw)) {
    where.status = statusRaw;
  }

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { [sortField]: order },
      take: limit,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  c.header("X-Total-Count", String(total));
  c.header("Access-Control-Expose-Headers", "X-Total-Count");
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
