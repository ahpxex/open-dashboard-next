import {
  CurrencyDollarIcon,
  GaugeIcon,
  PauseIcon,
  PlayIcon,
  PulseIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/charts";
import { relativeTime } from "@/components/NotificationCenter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiveQuery } from "@/lib/use-live-query";

export const Route = createFileRoute("/_app/gallery/realtime")({
  component: RealtimeDemo,
});

/**
 * Demo data source. A real app's `queryFn` calls a server fn; here we mutate a
 * module-level snapshot each fetch so you can SEE the metrics and feed move on
 * every poll. (Random walks are fine in route code — only workflow scripts ban
 * `Math.random()`/`new Date()`.)
 */
type Snapshot = {
  activeUsers: number;
  revenueToday: number;
  requestsPerSec: number;
  feed: { id: string; who: string; what: string; at: number }[];
};

const ACTORS = ["Ava", "Marcus", "Priya", "Jordan", "Sofia", "Liam"];
const ACTIONS = [
  "placed an order",
  "signed up",
  "upgraded their plan",
  "opened a ticket",
  "left a review",
  "cancelled a subscription",
];

let snapshot: Snapshot = {
  activeUsers: 312,
  revenueToday: 18_420,
  requestsPerSec: 47,
  feed: [],
};
let feedSeq = 0;

function tick(): Snapshot {
  const drift = (base: number, spread: number) =>
    Math.max(0, Math.round(base + (Math.random() - 0.5) * spread));

  const event = {
    id: `f-${(feedSeq++).toString(36)}`,
    who: ACTORS[Math.floor(Math.random() * ACTORS.length)],
    what: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
    at: Date.now(),
  };

  snapshot = {
    activeUsers: drift(snapshot.activeUsers, 24),
    revenueToday: snapshot.revenueToday + Math.round(Math.random() * 220),
    requestsPerSec: drift(snapshot.requestsPerSec, 18),
    feed: [event, ...snapshot.feed].slice(0, 8),
  };
  return snapshot;
}

async function fetchSnapshot(): Promise<Snapshot> {
  // Stand-in for a server fn round-trip.
  return tick();
}

function RealtimeDemo() {
  const [live, setLive] = useState(true);

  const { data, lastUpdated, isLive } = useLiveQuery(
    {
      queryKey: ["gallery", "realtime"],
      queryFn: fetchSnapshot,
    },
    { intervalMs: 2000, live },
  );

  // Re-render the "updated Ns ago" label between fetches.
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const updatedLabel = lastUpdated ? relativeTime(lastUpdated) : "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Live metrics & activity
          </h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            A panel and feed that auto-refresh on an interval via{" "}
            <code>useLiveQuery</code> (a <code>refetchInterval</code> wrapper).
            Toggle Live/Paused to start and stop polling; the timestamp shows
            how stale the data is. Swap the interval for an{" "}
            <code>EventSource</code> to push instead of poll — same query key,
            same UI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isLive ? "default" : "secondary"} className="gap-1">
            <PulseIcon
              className="size-3"
              weight={isLive ? "fill" : "regular"}
            />
            {isLive ? "Live" : "Paused"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLive((v) => !v)}
          >
            {isLive ? <PauseIcon /> : <PlayIcon />}
            {isLive ? "Pause" : "Resume"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Active users"
          value={data ? data.activeUsers.toLocaleString() : "—"}
          icon={UsersThreeIcon}
        />
        <StatCard
          label="Revenue today"
          value={data ? `$${data.revenueToday.toLocaleString()}` : "—"}
          icon={CurrencyDollarIcon}
        />
        <StatCard
          label="Requests / sec"
          value={data ? data.requestsPerSec.toLocaleString() : "—"}
          icon={GaugeIcon}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Activity</CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            updated {updatedLabel}
          </span>
        </CardHeader>
        <CardContent>
          {data && data.feed.length > 0 ? (
            <ul className="divide-y divide-border">
              {data.feed.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="text-foreground">
                    <span className="font-medium">{row.who}</span>{" "}
                    <span className="text-muted-foreground">{row.what}</span>
                  </span>
                  <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {relativeTime(row.at)}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Waiting for events…
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
