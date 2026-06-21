import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
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
 * resource's `server.ts`.
 *
 * RLS is enforced on the data path. The repository's client is built PER REQUEST
 * with the ANON key plus the signed-in user's JWT (forwarded from the request's
 * Supabase auth cookie via `@supabase/ssr`), so every PostgREST call runs as the
 * `authenticated` role and the table's row-level-security policies actually
 * apply. The anon key + a user JWT is the shipped path — NOT the service-role
 * key, which would bypass RLS entirely and is therefore reserved for explicit
 * admin operations only (see `adminClient` below). The queries, table, forms, and
 * detail pages are unchanged.
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

/** Cookie pairs for `@supabase/ssr` from the request's `cookie` header. */
function parseCookies(header: string | null): { name: string; value: string }[] {
  if (!header) return [];
  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf("=");
      if (eq === -1) return { name: part, value: "" };
      return {
        name: part.slice(0, eq),
        value: decodeURIComponent(part.slice(eq + 1)),
      };
    });
}

/**
 * Build a request-scoped client on the ANON key that carries the user's session.
 * `@supabase/ssr` reads the auth cookie off the request and attaches the user's
 * access token, so PostgREST sees `role: authenticated` and RLS is enforced.
 * `setAll` is a no-op here: the data path never refreshes the session (the auth
 * guard's `getSession` owns the refresh + cookie write-back). Call inside a
 * server fn that has already run `requireUser()`.
 */
function userClient() {
  const { headers } = getRequest();
  return createServerClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: () => parseCookies(headers.get("cookie")),
        setAll: () => {},
      },
    },
  );
}

/**
 * SERVICE-ROLE client — bypasses RLS. Reserved for explicitly-admin server-to-
 * server operations (e.g. background jobs, cross-tenant maintenance) that must
 * run regardless of any single user's row permissions. Do NOT use it for the
 * per-user CRUD below: that would silently defeat the RLS policies. Lazily
 * constructed so the key is read only if an admin op actually needs it.
 */
let _adminClient: ReturnType<typeof createClient> | null = null;
export function adminClient() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return _adminClient;
}

export const productsRepository = supabaseRepository<
  Product,
  ProductInput,
  RawProduct
>({
  // Request-scoped, RLS-respecting client (anon key + the user's forwarded JWT).
  client: userClient,
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
