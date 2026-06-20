import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/gallery/list-lite")({
  component: ListLiteDemo,
});

const NAMES = [
  "Ada Lovelace",
  "Grace Hopper",
  "Alan Turing",
  "Katherine Johnson",
  "Linus Torvalds",
  "Margaret Hamilton",
  "Dennis Ritchie",
  "Barbara Liskov",
  "Ken Thompson",
  "Radia Perlman",
  "Tim Berners-Lee",
  "Hedy Lamarr",
  "John Carmack",
  "Joan Clarke",
  "Guido van Rossum",
  "Frances Allen",
];

const ROLES = ["Admin", "Engineer", "Designer", "Analyst", "Manager"];
const TEAMS = ["Platform", "Growth", "Billing", "Data", "Security"];
const TIMES = [
  "just now",
  "2m ago",
  "8m ago",
  "23m ago",
  "1h ago",
  "3h ago",
  "yesterday",
  "2d ago",
];
const STATUSES = ["active", "away", "offline"] as const;
const STATUS_VARIANT = {
  active: "default",
  away: "secondary",
  offline: "outline",
} as const;

type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  team: string;
  time: string;
  status: (typeof STATUSES)[number];
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const MEMBERS: Member[] = Array.from({ length: 16 }, (_, i) => {
  const name = NAMES[i % NAMES.length];
  const handle = name.toLowerCase().replace(/[^a-z]+/g, ".");
  return {
    id: i + 1,
    name,
    email: `${handle}@acme.dev`,
    role: ROLES[i % ROLES.length],
    team: TEAMS[i % TEAMS.length],
    time: TIMES[i % TIMES.length],
    status: STATUSES[i % STATUSES.length],
  };
});

/**
 * Dense / lite list variant — a compact row list (not a table) with a leading
 * avatar, a primary + secondary line, and a trailing meta. Search filters the
 * list locally by name. Gallery demo: deterministic data, no server.
 */
function ListLiteDemo() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MEMBERS;
    return MEMBERS.filter((m) => m.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          List view (dense / lite)
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A compact row list instead of a table — leading avatar, a primary name
          with a muted secondary line, and a trailing status/time. The search
          box filters by name on the client.
        </p>
      </div>

      <div>
        <div className="relative">
          <MagnifyingGlassIcon
            size={14}
            className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter members by name…"
            className="pl-7"
          />
        </div>

        <div className="mt-3 divide-y divide-border border border-border">
          {filtered.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-muted/50"
            >
              <Avatar size="sm">
                <AvatarFallback>{initials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm leading-tight">
                  {member.name}
                </p>
                <p className="truncate text-muted-foreground text-xs leading-tight">
                  {member.email} · {member.role} · {member.team}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge variant={STATUS_VARIANT[member.status]}>
                  {member.status}
                </Badge>
                <span className="w-16 text-right text-muted-foreground text-xs tabular-nums">
                  {member.time}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center text-muted-foreground text-sm">
              No members match “{query}”.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
