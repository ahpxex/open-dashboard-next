import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionMenu } from "@/infra/ui";
import type { Post } from "./schema";

export interface PostCardContext {
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

/** Card renderer for a post — the card-list parallel to `columns.tsx`. */
export function PostCard({
  post,
  context,
}: {
  post: Post;
  context: PostCardContext;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <CardTitle className="line-clamp-2 text-sm leading-snug">
          {post.title}
        </CardTitle>
        <div className="-mr-1 shrink-0">
          <ActionMenu
            onEdit={() => context.onEdit(post)}
            onDelete={() => context.onDelete(post)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-3">
        <p className="line-clamp-3 text-xs text-muted-foreground">
          {post.body}
        </p>
        <span className="text-xs text-muted-foreground tabular-nums">
          Author · User {post.userId}
        </span>
      </CardContent>
    </Card>
  );
}
