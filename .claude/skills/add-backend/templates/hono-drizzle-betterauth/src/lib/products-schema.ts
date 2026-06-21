/**
 * Zod schemas + whitelists for the `products` resource, mirroring the frontend's
 * src/features/products/schema.ts and CONTRACT.md §0 exactly.
 */
import { z } from "zod";

export const productStatuses = [
  "available",
  "out_of_stock",
  "discontinued",
] as const;

export type ProductStatus = (typeof productStatuses)[number];

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create body. `description` is optional and defaults to "". Coerces numeric
 * fields so string-over-the-wire values (`"12.5"`) are accepted, matching the
 * frontend's coercing `productInputSchema`. `.strict()` rejects unknown fields.
 */
export const productInputSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required"),
    category: z.string().min(1, "Category is required"),
    price: z.coerce.number().min(0, "Price must be >= 0"),
    stock: z.coerce.number().int().min(0, "Stock must be >= 0"),
    status: z.enum(productStatuses),
    description: z.string().optional().default(""),
  })
  .strict();

export type ProductInput = z.infer<typeof productInputSchema>;

/** Update body — every field optional, but the same constraints when present. */
export const productPatchSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required"),
    category: z.string().min(1, "Category is required"),
    price: z.coerce.number().min(0, "Price must be >= 0"),
    stock: z.coerce.number().int().min(0, "Stock must be >= 0"),
    status: z.enum(productStatuses),
    description: z.string(),
  })
  .strict()
  .partial();

export type ProductPatch = z.infer<typeof productPatchSchema>;

/**
 * Whitelists (CONTRACT.md §0) — never sort/filter by raw user input.
 */
export const SEARCHABLE = ["name", "sku", "category"] as const;
export const SORTABLE = [
  "name",
  "category",
  "price",
  "stock",
  "createdAt",
] as const;
export type SortField = (typeof SORTABLE)[number];

export const DEFAULT_SORT: SortField = "createdAt";
export const DEFAULT_ORDER: "asc" | "desc" = "desc";

export function resolveSort(raw: string | undefined): SortField {
  if (raw && (SORTABLE as readonly string[]).includes(raw)) {
    return raw as SortField;
  }
  return DEFAULT_SORT;
}

export function resolveOrder(raw: string | undefined): "asc" | "desc" {
  return raw === "asc" || raw === "desc" ? raw : DEFAULT_ORDER;
}

export function isValidStatus(value: string): value is ProductStatus {
  return (productStatuses as readonly string[]).includes(value);
}
