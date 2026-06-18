import { z } from "zod";

/** A blog post as served by the public REST API (jsonplaceholder). */
export interface Post {
  id: string;
  userId: number;
  title: string;
  body: string;
}

/** Mutation input. */
export const postInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  userId: z.coerce.number().int().min(1, "User is required"),
});
export type PostInput = z.infer<typeof postInputSchema>;

/** Client-side form validator (numeric input stays a number). */
export const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  userId: z
    .number({ message: "User is required" })
    .int()
    .min(1, "User must be 1–10")
    .max(10, "User must be 1–10"),
});

export const postUpdateSchema = postInputSchema.extend({
  id: z.string().min(1),
});
export type PostUpdate = z.infer<typeof postUpdateSchema>;

export const postListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  /** Filter by author id (1–10), surfaced as a select. */
  userId: z.string().optional().default(""),
});
export type PostListParams = z.infer<typeof postListParamsSchema>;
