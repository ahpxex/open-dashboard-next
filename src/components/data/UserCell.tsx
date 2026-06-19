import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * An identity cell: an initials avatar beside the name, with the email shown
 * muted underneath. Designed to drop straight into a table cell.
 */
export function UserCell({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar size="sm">
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-medium text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground">{email}</span>
      </div>
    </div>
  );
}
