import type { ColumnDef } from "@tanstack/react-table";
import { ActionMenu } from "@/infra/ui";
import type { Post } from "./schema";

export interface PostTableContext {
  onEdit: (row: Post) => void;
  onDelete: (row: Post) => void;
}

export function createPostsColumns(
  context: PostTableContext,
): ColumnDef<Post>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      cell: (info) => (
        <span className="line-clamp-1 font-medium">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "body",
      header: "Body",
      enableSorting: false,
      cell: (info) => (
        <span className="line-clamp-2 max-w-md text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "userId",
      header: "Author",
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">
          User {info.getValue() as number}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex justify-end">
            <ActionMenu
              onEdit={() => context.onEdit(row)}
              onDelete={() => context.onDelete(row)}
            />
          </div>
        );
      },
    },
  ];
}
