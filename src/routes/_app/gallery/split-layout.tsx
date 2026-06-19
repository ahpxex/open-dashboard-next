import {
  CalendarBlankIcon,
  PaperPlaneTiltIcon,
  TagIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DescriptionList, StatusChip } from "@/infra/ui";

export const Route = createFileRoute("/_app/gallery/split-layout")({
  component: SplitLayoutDemo,
});

const COMMENTS: { id: string; author: string; at: string; body: string }[] = [
  {
    id: "c1",
    author: "Dana Whitfield",
    at: "2026-06-15 10:12",
    body: "Reproduced on staging — the export stalls at ~80% for large datasets.",
  },
  {
    id: "c2",
    author: "Avery Quinn",
    at: "2026-06-15 11:48",
    body: "Looks like the worker times out. I'll add streaming so we don't buffer the whole file.",
  },
  {
    id: "c3",
    author: "Priya Nair",
    at: "2026-06-16 09:03",
    body: "Bumped priority to high — two enterprise accounts are blocked on this.",
  },
];

/**
 * Split / two-column responsive layout. Gallery demo: a main content column
 * (description + activity) alongside a fixed-width metadata aside that collapses
 * below it on small screens via `lg:grid-cols-[1fr_320px]`.
 */
function SplitLayoutDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Split / two-column layout
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A content column beside a fixed-width metadata aside. On narrow
          screens the aside stacks underneath the main content.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tight">
              Export job times out on large datasets
            </h2>
            <StatusChip
              status="open"
              colorMap={{ open: "warning" }}
              labelMap={{ open: "Open" }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <p>
                When exporting more than ~50k rows, the CSV job hangs and
                eventually fails with a gateway timeout. Smaller exports finish
                normally, so the regression appears tied to the buffering step
                rather than the query itself.
              </p>
              <p>
                Proposed fix is to stream rows to the client incrementally
                instead of materializing the full file in memory before sending.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {COMMENTS.map((comment) => (
                <div key={comment.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <UserCircleIcon
                      size={18}
                      className="text-muted-foreground"
                    />
                    <span className="text-sm font-medium">
                      {comment.author}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {comment.at}
                    </span>
                  </div>
                  <p className="pl-6 text-sm text-muted-foreground">
                    {comment.body}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-end">
                <Button>
                  <PaperPlaneTiltIcon size={16} />
                  Add comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Assignee", value: "Avery Quinn" },
                  { label: "Reporter", value: "Dana Whitfield" },
                  { label: "Priority", value: "High" },
                  { label: "Component", value: "Reporting" },
                  { label: "Opened", value: "2026-06-15" },
                  { label: "Due", value: "2026-06-22" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Labels</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <TagIcon size={12} />
                bug
              </Badge>
              <Badge variant="outline">
                <TagIcon size={12} />
                performance
              </Badge>
              <Badge variant="outline">
                <TagIcon size={12} />
                exports
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Milestone</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm">
              <CalendarBlankIcon size={16} className="text-muted-foreground" />
              <span>v2.4 — Reliability</span>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
