import { beforeEach, describe, expect, it, vi } from "vitest";

// A chainable, awaitable stand-in for a Drizzle query builder.
const h = vi.hoisted(() => {
  function makeThenable(result: unknown) {
    const calls: Record<string, unknown[]> = {};
    const q: Record<string, unknown> = {};
    for (const m of ["from", "where", "orderBy", "limit", "offset", "set"]) {
      q[m] = vi.fn((...args: unknown[]) => {
        calls[m] = args;
        return q;
      });
    }
    q.returning = vi.fn(() => Promise.resolve(result));
    q.then = (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) =>
      Promise.resolve(result).then(res, rej);
    q.__calls = calls;
    return q;
  }
  const dbMock = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { dbMock, makeThenable };
});

vi.mock("@/db", () => ({ db: h.dbMock }));

import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { drizzleRepository } from "./drizzle-repository";

// A self-contained fixture table so this adapter test depends on no demo
// resource — the demo (`products`/`orders`/`posts`) is removable via
// `bun run strip-demo`, and the platform tests must stay green afterwards.
const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: doublePrecision("price").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  status: text("status").notNull().default("active"),
  sku: text("sku").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const repo = drizzleRepository(items, {
  searchColumns: [items.name, items.sku],
  sortColumns: { name: items.name, price: items.price },
  filterColumns: { status: items.status },
  defaultSort: { column: items.createdAt, dir: "desc" },
  updatedAtKey: "updatedAt",
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("drizzleRepository.list", () => {
  it("computes offset/limit from page/pageSize and returns { rows, total }", async () => {
    const sampleRows = [{ id: "1", name: "Widget" }];
    const rowsQ = h.makeThenable(sampleRows) as any;
    const countQ = h.makeThenable([{ value: 42 }]) as any;
    // No-arg select → rows; select({ value }) → count.
    h.dbMock.select.mockImplementation((arg?: unknown) =>
      arg ? countQ : rowsQ,
    );

    const result = await repo.list({ page: 3, pageSize: 10, search: "wid" });

    expect(result).toEqual({ rows: sampleRows, total: 42 });
    expect(rowsQ.__calls.limit[0]).toBe(10);
    expect(rowsQ.__calls.offset[0]).toBe(20); // (3 - 1) * 10
    expect(rowsQ.where).toHaveBeenCalled(); // a search condition was applied
  });

  it("applies no where clause when there is no search or filter", async () => {
    const rowsQ = h.makeThenable([]) as any;
    const countQ = h.makeThenable([{ value: 0 }]) as any;
    h.dbMock.select.mockImplementation((arg?: unknown) =>
      arg ? countQ : rowsQ,
    );

    await repo.list({ page: 1, pageSize: 20 });

    expect(rowsQ.__calls.where[0]).toBeUndefined();
  });
});

describe("drizzleRepository getOne/create/update/remove", () => {
  it("getOne returns the row, or null when missing", async () => {
    h.dbMock.select.mockReturnValueOnce(h.makeThenable([{ id: "1" }]));
    expect(await repo.getOne("1")).toEqual({ id: "1" });

    h.dbMock.select.mockReturnValueOnce(h.makeThenable([]));
    expect(await repo.getOne("nope")).toBeNull();
  });

  it("create inserts and returns the row", async () => {
    const values = vi.fn(() => ({
      returning: () => Promise.resolve([{ id: "new", name: "X" }]),
    }));
    h.dbMock.insert.mockReturnValue({ values });

    const row = await repo.create({
      name: "X",
      sku: "S",
      category: "C",
      price: 1,
      stock: 1,
      status: "available",
    });

    expect(h.dbMock.insert).toHaveBeenCalledWith(items);
    expect(row).toEqual({ id: "new", name: "X" });
  });

  it("update stamps updatedAt and returns the row", async () => {
    const setSpy = vi.fn((_values: Record<string, unknown>) => ({
      where: () => ({ returning: () => Promise.resolve([{ id: "1" }]) }),
    }));
    h.dbMock.update.mockReturnValue({ set: setSpy });

    await repo.update("1", { name: "Renamed" });

    const setArg = setSpy.mock.calls[0][0];
    expect(setArg.name).toBe("Renamed");
    expect(setArg.updatedAt).toBeInstanceOf(Date);
  });

  it("remove issues a delete", async () => {
    const where = vi.fn(() => Promise.resolve(undefined));
    h.dbMock.delete.mockReturnValue({ where });

    await repo.remove("1");
    expect(h.dbMock.delete).toHaveBeenCalledWith(items);
    expect(where).toHaveBeenCalled();
  });
});
