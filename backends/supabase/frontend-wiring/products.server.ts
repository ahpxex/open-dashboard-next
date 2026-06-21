import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/require-user";
import {
  type ProductListParams,
  productInputSchema,
  productListParamsSchema,
  productUpdateSchema,
} from "@/features/products/schema";
import type { Product, ProductInput } from "@/features/products/schema";
import { supabaseRepository } from "./supabase-repository";

/**
 * Example: bind the `products` resource to Supabase. Drop this in as the
 * resource's `server.ts`. The server-side client uses the SERVICE-ROLE key on
 * the trusted server-to-server hop (the fetch runs inside a server fn that has
 * already called `requireUser()`) — it never reaches the browser. The queries,
 * table, forms, and detail pages are unchanged.
 */

interface RawProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number | string;
  stock: number;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const client = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export const productsRepository = supabaseRepository<
  Product,
  ProductInput,
  RawProduct
>({
  client,
  table: "products",
  // snake_case row -> camelCase Product (and coerce numeric price to a number).
  map: (raw) => ({
    id: raw.id,
    name: raw.name,
    sku: raw.sku,
    category: raw.category,
    price: Number(raw.price),
    stock: raw.stock,
    status: raw.status as Product["status"],
    description: raw.description,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }),
  // camelCase input -> snake_case row; server-owned timestamps are omitted
  // (DB default + trigger set created_at / updated_at).
  serialize: (input) => ({
    name: input.name,
    sku: input.sku,
    category: input.category,
    price: input.price,
    stock: input.stock,
    status: input.status,
    description: input.description,
  }),
  searchColumns: ["name", "sku", "category"],
  sortColumns: {
    name: "name",
    category: "category",
    price: "price",
    stock: "stock",
    createdAt: "created_at",
  },
  filterColumns: { status: "status" },
  defaultSort: { column: "created_at", ascending: false },
});

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
