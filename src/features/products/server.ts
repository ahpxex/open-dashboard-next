import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { products } from "@/db/schema";
import { drizzleRepository } from "@/infra/data";
import { requireUser } from "@/lib/require-user";
import {
  type ProductListParams,
  productInputSchema,
  productListParamsSchema,
  productUpdateSchema,
} from "./schema";

/**
 * The products resource is backed by Postgres via the Drizzle adapter. Swapping
 * to a REST/GraphQL backend means changing only this binding — the server fns,
 * queries, table, and forms stay the same.
 */
export const productsRepository = drizzleRepository(products, {
  searchColumns: [products.name, products.sku, products.category],
  sortColumns: {
    name: products.name,
    category: products.category,
    price: products.price,
    stock: products.stock,
    createdAt: products.createdAt,
  },
  filterColumns: { status: products.status },
  defaultSort: { column: products.createdAt, dir: "desc" },
  updatedAtKey: "updatedAt",
});

/** Map the resource's params (flat `status`) to the repository's `filters`. */
function toListParams(data: ProductListParams) {
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: data.status ? { status: data.status } : undefined,
  };
}

export const listProducts = createServerFn({ method: "GET" })
  .validator((data: ProductListParams) => productListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return productsRepository.list(toListParams(data));
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    return productsRepository.getOne(id);
  });

export const createProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => productInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return productsRepository.create(data);
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => productUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return productsRepository.update(id, values);
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await productsRepository.remove(id);
    return { id };
  });
