import {
  and,
  asc,
  count,
  desc,
  eq,
  type InferInsertModel,
  type InferSelectModel,
  ilike,
  or,
  type SQL,
} from "drizzle-orm";
import type { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import type { ListParams, ListResult, Repository, SortDir } from "./repository";

/** A drizzle table that has an `id` column (every resource table does). */
type TableWithId = PgTable & { id: AnyPgColumn };

export interface DrizzleRepositoryConfig {
  /** Columns OR-searched with `ilike %term%` when `params.search` is set. */
  searchColumns?: AnyPgColumn[];
  /** Whitelist of sortable columns keyed by the `sortBy` value (never sort by raw input). */
  sortColumns: Record<string, AnyPgColumn>;
  /** Maps a `filters` key to the column it equality-filters on. */
  filterColumns?: Record<string, AnyPgColumn>;
  /** Fallback sort when `sortBy` is missing/unknown. */
  defaultSort: { column: AnyPgColumn; dir?: SortDir };
  /** Property key to stamp with `new Date()` on update (e.g. `"updatedAt"`). */
  updatedAtKey?: string;
}

/**
 * Postgres-via-Drizzle implementation of {@link Repository}. Type parameters are
 * inferred from the table, so `drizzleRepository(products, …)` yields a
 * `Repository<Product, NewProduct>` with no manual typing.
 *
 * ```ts
 * export const productsRepo = drizzleRepository(products, {
 *   searchColumns: [products.name, products.sku, products.category],
 *   sortColumns: { name: products.name, price: products.price },
 *   filterColumns: { status: products.status },
 *   defaultSort: { column: products.createdAt, dir: "desc" },
 *   updatedAtKey: "updatedAt",
 * });
 * ```
 */
export function drizzleRepository<TTable extends TableWithId>(
  table: TTable,
  config: DrizzleRepositoryConfig,
): Repository<InferSelectModel<TTable>, InferInsertModel<TTable>> {
  type T = InferSelectModel<TTable>;
  type TInput = InferInsertModel<TTable>;

  // Drizzle's query builder resists an abstract generic table param (its
  // selection-inference conditionals fail). Use a loose ref for the builder
  // calls while the public Repository<T, TInput> types stay precise. The `id`
  // column is read off the real `table` so `eq` keeps a typed column.
  const t = table as any;
  const idColumn = table.id;

  const buildWhere = (params: ListParams): SQL | undefined => {
    const conditions: SQL[] = [];

    if (params.search && config.searchColumns?.length) {
      const term = `%${params.search}%`;
      const matcher = or(
        ...config.searchColumns.map((col) => ilike(col, term)),
      );
      if (matcher) conditions.push(matcher);
    }

    if (params.filters && config.filterColumns) {
      for (const [key, value] of Object.entries(params.filters)) {
        const column = config.filterColumns[key];
        if (column && value) conditions.push(eq(column, value));
      }
    }

    return conditions.length ? and(...conditions) : undefined;
  };

  return {
    async list(params) {
      const where = buildWhere(params);
      const sortColumn =
        (params.sortBy && config.sortColumns[params.sortBy]) ||
        config.defaultSort.column;
      const dir = params.sortDir ?? config.defaultSort.dir ?? "desc";
      const orderBy = dir === "asc" ? asc(sortColumn) : desc(sortColumn);
      const offset = (params.page - 1) * params.pageSize;

      const [rows, totalResult] = await Promise.all([
        db
          .select()
          .from(t)
          .where(where)
          .orderBy(orderBy)
          .limit(params.pageSize)
          .offset(offset),
        db.select({ value: count() }).from(t).where(where),
      ]);

      return {
        rows: rows as T[],
        total: totalResult[0]?.value ?? 0,
      } satisfies ListResult<T>;
    },

    async getOne(id) {
      const rows = (await db
        .select()
        .from(t)
        .where(eq(idColumn, id))
        .limit(1)) as T[];
      return rows[0] ?? null;
    },

    async create(input) {
      const rows = (await db
        .insert(t)
        .values(input as never)
        .returning()) as T[];
      return rows[0];
    },

    async update(id, input) {
      const values = config.updatedAtKey
        ? { ...input, [config.updatedAtKey]: new Date() }
        : input;
      const rows = (await db
        .update(t)
        .set(values as never)
        .where(eq(idColumn, id))
        .returning()) as T[];
      return rows[0];
    },

    async remove(id) {
      await db.delete(t).where(eq(idColumn, id));
    },
  };
}
