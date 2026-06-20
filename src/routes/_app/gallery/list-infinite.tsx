import { CheckIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { type UIEvent, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/gallery/list-infinite")({
  component: ListInfiniteDemo,
});

const FIRST = [
  "Ada",
  "Grace",
  "Alan",
  "Katherine",
  "Linus",
  "Margaret",
  "Dennis",
  "Barbara",
  "Ken",
  "Radia",
  "Tim",
  "Hedy",
];
const LAST = [
  "Lovelace",
  "Hopper",
  "Turing",
  "Johnson",
  "Torvalds",
  "Hamilton",
  "Ritchie",
  "Liskov",
  "Thompson",
  "Perlman",
];
const TAGS = ["frontend", "backend", "infra", "design", "data", "mobile"];

const TOTAL = 200;
const PAGE = 20;

type Item = {
  id: number;
  name: string;
  email: string;
  tag: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const ITEMS: Item[] = Array.from({ length: TOTAL }, (_, i) => {
  const name = `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`;
  const handle = name.toLowerCase().replace(/[^a-z]+/g, ".");
  return {
    id: i + 1,
    name,
    email: `${handle}.${i + 1}@acme.dev`,
    tag: TAGS[i % TAGS.length],
  };
});

/**
 * Infinite / load-more list — renders a deterministic 200-item dataset in
 * pages of 20. The "Load more" button grows the window; scrolling near the
 * bottom of the container also triggers the next page. Gallery demo, no server.
 */
function ListInfiniteDemo() {
  const [count, setCount] = useState(PAGE);
  const visible = ITEMS.slice(0, count);
  const hasMore = count < TOTAL;

  const loadMore = () => setCount((c) => Math.min(c + PAGE, TOTAL));

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    if (!hasMore) return;
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      loadMore();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Infinite / load-more list
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A windowed list that grows in pages of {PAGE}. Click “Load more” or
          scroll near the bottom to reveal the next page. Deterministic dataset
          of {TOTAL} items — no server fetch.
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-muted-foreground text-xs">
          <span className="tabular-nums">
            Showing {visible.length} of {TOTAL}
          </span>
        </div>

        <div
          onScroll={onScroll}
          className="h-[480px] divide-y divide-border overflow-auto border border-border"
        >
          {visible.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <Avatar size="sm">
                <AvatarFallback>{initials(item.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm leading-tight">
                  <span className="text-muted-foreground tabular-nums">
                    #{item.id}
                  </span>{" "}
                  {item.name}
                </p>
                <p className="truncate text-muted-foreground text-xs leading-tight">
                  {item.email}
                </p>
              </div>
              <Badge variant="outline">{item.tag}</Badge>
            </div>
          ))}

          <div className="flex items-center justify-center p-4">
            {hasMore ? (
              <Button variant="outline" size="sm" onClick={loadMore}>
                Load more
              </Button>
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <CheckIcon size={14} />
                End of list — {TOTAL} items loaded
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
