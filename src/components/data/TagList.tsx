import { Badge } from "@/components/ui/badge";

/**
 * A wrapping row of tag badges. Empty input renders a muted dash so the slot
 * never collapses in a table cell or detail row.
 */
export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
