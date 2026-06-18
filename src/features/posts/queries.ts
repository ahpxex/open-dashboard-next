import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { PostInput, PostListParams, PostUpdate } from "./schema";
import { createPost, deletePost, listPosts, updatePost } from "./server";

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (params: PostListParams) => [...postKeys.lists(), params] as const,
};

export function postsListQuery(params: PostListParams) {
  return queryOptions({
    queryKey: postKeys.list(params),
    queryFn: () => listPosts({ data: params }),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PostInput) => createPost({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toastSuccess("Post created");
    },
    onError: (err) => toastError(err, "Failed to create post"),
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PostUpdate) => updatePost({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toastSuccess("Post updated");
    },
    onError: (err) => toastError(err, "Failed to update post"),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePost({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toastSuccess("Post deleted");
    },
    onError: (err) => toastError(err, "Failed to delete post"),
  });
}
