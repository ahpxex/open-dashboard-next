import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { restRepository } from "@/infra/data";
import { requireUser } from "@/lib/require-user";
import {
  type Post,
  type PostInput,
  type PostListParams,
  postInputSchema,
  postListParamsSchema,
  postUpdateSchema,
} from "./schema";

interface RawPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

/**
 * The posts resource is backed by a public REST API instead of Postgres — the
 * same shapes (queries, table, form, detail) work unchanged. The fetch happens
 * inside these server fns, so an API origin/key would never reach the browser.
 *
 * Note: jsonplaceholder is read-only; writes are echoed back (200 OK) but not
 * persisted, so created/edited rows won't appear in subsequent list reads.
 */
export const postsRepository = restRepository<Post, PostInput, RawPost>({
  baseUrl: "https://jsonplaceholder.typicode.com",
  path: "/posts",
  map: (raw) => ({
    id: String(raw.id),
    userId: raw.userId,
    title: raw.title,
    body: raw.body,
  }),
});

function toListParams(data: PostListParams) {
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: data.userId ? { userId: data.userId } : undefined,
  };
}

export const listPosts = createServerFn({ method: "GET" })
  .validator((data: PostListParams) => postListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return postsRepository.list(toListParams(data));
  });

export const getPost = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    return postsRepository.getOne(id);
  });

export const createPost = createServerFn({ method: "POST" })
  .validator((data: unknown) => postInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return postsRepository.create(data);
  });

export const updatePost = createServerFn({ method: "POST" })
  .validator((data: unknown) => postUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return postsRepository.update(id, values);
  });

export const deletePost = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await postsRepository.remove(id);
    return { id };
  });
