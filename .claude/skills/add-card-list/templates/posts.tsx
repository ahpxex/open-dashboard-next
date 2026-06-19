import { PlusIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FormError,
  NumberField,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostCard } from "@/features/posts/cards";
import { postsFilters, postsTableConfig } from "@/features/posts/config";
import {
  postsListQuery,
  useCreatePost,
  useDeletePost,
  useUpdatePost,
} from "@/features/posts/queries";
import {
  type Post,
  type PostInput,
  postFormSchema,
  postInputSchema,
  postListParamsSchema,
} from "@/features/posts/schema";
import { CardList, useResourceList } from "@/infra/list";
import { errorMessage } from "@/lib/toast";

export const Route = createFileRoute("/_app/posts")({
  validateSearch: postListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(postsListQuery(deps)),
  component: PostsPage,
});

type DialogState = { mode: "create" | "edit"; post?: Post } | null;

function PostsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { table, rows, total, isLoading, refetch } = useResourceList<
    typeof search,
    Post
  >(search, navigate, postsListQuery);
  const [dialog, setDialog] = useState<DialogState>(null);

  const remove = useDeletePost();
  const confirm = useConfirm();

  const cardContext = {
    onEdit: (post: Post) => setDialog({ mode: "edit", post }),
    onDelete: async (post: Post) => {
      const ok = await confirm({
        title: "Delete this post?",
        description: post.title,
        confirmLabel: "Delete",
        destructive: true,
      });
      if (ok) remove.mutate(post.id);
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Posts</h1>
        <p className="text-sm text-muted-foreground">
          The Card/grid list archetype, backed by a public REST API
          (jsonplaceholder) via the <code>restRepository</code> adapter — same
          query/filter/paginate plumbing as the table. Reads are live; writes
          are echoed but not persisted.
        </p>
      </div>

      <CardList
        data={rows}
        total={total}
        isLoading={isLoading}
        getKey={(post) => post.id}
        renderCard={(post) => <PostCard post={post} context={cardContext} />}
        searchValue={search.search}
        onSearchChange={table.setSearch}
        searchPlaceholder={postsTableConfig.searchPlaceholder}
        filters={postsFilters}
        filterValues={{ userId: search.userId }}
        onFilterChange={table.setFilter}
        onRefresh={refetch}
        page={search.page}
        pageSize={search.pageSize}
        pageSizeOptions={postsTableConfig.pageSizeOptions}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyMessage={postsTableConfig.emptyMessage}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add post
          </Button>
        }
      />

      <PostFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        post={dialog?.post}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}

const EMPTY_FORM: PostInput = { title: "", body: "", userId: 1 };

function toForm(post?: Post): PostInput {
  if (!post) return { ...EMPTY_FORM };
  return { title: post.title, body: post.body, userId: post.userId };
}

function PostFormDialog({
  open,
  mode,
  post,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  post?: Post;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit post" : "New post"}
          </DialogTitle>
          <DialogDescription>
            Writes go through the REST adapter (echoed, not persisted).
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <PostForm
            key={post?.id ?? "new"}
            mode={mode}
            post={post}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PostForm({
  mode,
  post,
  onDone,
}: {
  mode: "create" | "edit";
  post?: Post;
  onDone: () => void;
}) {
  const create = useCreatePost();
  const update = useUpdatePost();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(post),
    validators: { onChange: postFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = postInputSchema.parse(value);
      try {
        if (mode === "edit" && post) {
          await update.mutateAsync({ id: post.id, ...payload });
        } else {
          await create.mutateAsync(payload);
        }
        onDone();
      } catch (err) {
        setServerError(errorMessage(err));
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <FormError message={serverError} />

      <TextField form={form} name="title" label="Title" required />
      <TextareaField form={form} name="body" label="Body" rows={4} required />
      <NumberField
        form={form}
        name="userId"
        label="Author (user id 1–10)"
        min={1}
        max={10}
        required
      />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <SubmitButton form={form}>Save</SubmitButton>
      </DialogFooter>
    </form>
  );
}
