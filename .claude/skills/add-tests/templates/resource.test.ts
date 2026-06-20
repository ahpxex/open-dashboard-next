import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";

/**
 * Exemplar resource test — the shape the `add-tests` skill copies to
 * `features/<name>/<name>.test.ts`.
 *
 * It is fully self-contained: a tiny in-file fixture type + seed, a
 * `memoryRepository` (the same adapter `server.ts` binds for zero-config
 * backends), and a stand-in for a resource's zod validator. It demonstrates
 * the two things worth testing in a resource:
 *
 *  1. The **data layer** — list with search / filter / sort / pagination, plus
 *     create / update / remove — against the in-memory adapter. Because every
 *     adapter implements the same `Repository` interface and applies the same
 *     `ListParams`, asserting behaviour here proves the resource's list params
 *     are wired correctly without touching a real database.
 *  2. The **validator** — a `createServerFn(...).validator(fn)` is just the zod
 *     `.parse`/`.safeParse` of the resource's input schema. Test it directly:
 *     it accepts good input and rejects bad input. No server runtime needed.
 */

// 1) A tiny fixture type — stand-in for a real resource row (`Product`, …).
interface Widget extends Record<string, unknown> {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

type WidgetInput = Omit<Widget, "id" | "createdAt" | "updatedAt">;

const seed: Widget[] = [
  {
    id: "1",
    name: "Anvil",
    category: "tools",
    price: 30,
    status: "active",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "2",
    name: "Bolt",
    category: "parts",
    price: 5,
    status: "archived",
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-02"),
  },
  {
    id: "3",
    name: "Clamp",
    category: "tools",
    price: 12,
    status: "active",
    createdAt: new Date("2026-01-03"),
    updatedAt: new Date("2026-01-03"),
  },
];

// A fresh repository per test so mutations don't leak between cases. Mirror the
// config your resource's `server.ts` passes (search / sort / filter whitelists).
function makeRepo() {
  return memoryRepository<Widget, WidgetInput>(seed, {
    searchFields: ["name", "category"],
    sortFields: ["name", "price", "createdAt"],
    filterFields: ["status"],
    defaultSort: { field: "createdAt", dir: "desc" },
    updatedAtKey: "updatedAt",
    createdAtKey: "createdAt",
  });
}

let repo: ReturnType<typeof makeRepo>;
beforeEach(() => {
  repo = makeRepo();
});

describe("resource data layer — list params", () => {
  it("paginates and reports the unfiltered-by-page total", async () => {
    const { rows, total } = await repo.list({ page: 1, pageSize: 2 });
    expect(total).toBe(3);
    expect(rows).toHaveLength(2);

    const page2 = await repo.list({ page: 2, pageSize: 2 });
    expect(page2.rows).toHaveLength(1);
    expect(page2.total).toBe(3);
  });

  it("searches case-insensitively across the search fields", async () => {
    const { rows, total } = await repo.list({
      page: 1,
      pageSize: 10,
      search: "TOOL", // matches the `category` field, case-insensitively
    });
    expect(total).toBe(2);
    expect(rows.every((r) => r.category === "tools")).toBe(true);
  });

  it("filters by an equality field", async () => {
    const { rows, total } = await repo.list({
      page: 1,
      pageSize: 10,
      filters: { status: "active" },
    });
    expect(total).toBe(2);
    expect(rows.every((r) => r.status === "active")).toBe(true);
  });

  it("sorts by a whitelisted field, ascending and descending", async () => {
    const asc = await repo.list({
      page: 1,
      pageSize: 10,
      sortBy: "price",
      sortDir: "asc",
    });
    expect(asc.rows.map((r) => r.price)).toEqual([5, 12, 30]);

    const desc = await repo.list({
      page: 1,
      pageSize: 10,
      sortBy: "price",
      sortDir: "desc",
    });
    expect(desc.rows.map((r) => r.price)).toEqual([30, 12, 5]);
  });

  it("ignores a non-whitelisted sort field and falls back to the default", async () => {
    // `status` is not in `sortFields` — never sort by raw user input.
    const { rows } = await repo.list({
      page: 1,
      pageSize: 10,
      sortBy: "status",
    });
    expect(rows.map((r) => r.id)).toEqual(["3", "2", "1"]); // createdAt desc
  });
});

describe("resource data layer — mutations", () => {
  it("create assigns an id + timestamps and is immediately listable", async () => {
    const created = await repo.create({
      name: "Dowel",
      category: "parts",
      price: 2,
      status: "active",
    });
    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeInstanceOf(Date);

    const { total } = await repo.list({ page: 1, pageSize: 10 });
    expect(total).toBe(4);
    expect(await repo.getOne(created.id)).not.toBeNull();
  });

  it("update merges fields and bumps updatedAt", async () => {
    const updated = await repo.update("1", { price: 99 });
    expect(updated.price).toBe(99);
    expect(updated.name).toBe("Anvil"); // untouched fields preserved
  });

  it("remove deletes the row", async () => {
    await repo.remove("1");
    expect(await repo.getOne("1")).toBeNull();
    const { total } = await repo.list({ page: 1, pageSize: 10 });
    expect(total).toBe(2);
  });
});

// 2) The validator. A `createServerFn(...).validator((d) => schema.parse(d))`
//    is exactly this schema — test the schema and you test the validator.
const widgetInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1),
  price: z.coerce.number().min(0, "Price must be ≥ 0"),
  status: z.enum(["active", "archived"]),
});

describe("resource input validator", () => {
  it("accepts well-formed input (and coerces a numeric string on the wire)", () => {
    const result = widgetInputSchema.safeParse({
      name: "Anvil",
      category: "tools",
      price: "30", // arrives as a string over the wire; coerced to a number
      status: "active",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.price).toBe(30);
  });

  it("rejects a missing required field", () => {
    const result = widgetInputSchema.safeParse({
      name: "",
      category: "tools",
      price: 30,
      status: "active",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an out-of-range value", () => {
    const result = widgetInputSchema.safeParse({
      name: "Anvil",
      category: "tools",
      price: -1,
      status: "active",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a value outside the status enum", () => {
    const result = widgetInputSchema.safeParse({
      name: "Anvil",
      category: "tools",
      price: 30,
      status: "deleted",
    });
    expect(result.success).toBe(false);
  });
});
