import {
  ChatCircleIcon,
  CheckCircleIcon,
  GitCommitIcon,
  type Icon,
  TagIcon,
  UploadSimpleIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";

export const Route = createFileRoute("/_app/gallery/timeline")({
  component: TimelineDemo,
});

type ActivityEvent = {
  id: string;
  actor: string;
  action: string;
  time: string;
  icon: Icon;
  tone: "primary" | "success" | "muted";
};

type ActivityGroup = {
  label: string;
  events: ActivityEvent[];
};

// Reverse-chronological, grouped by day with fixed label strings.
const GROUPS: ActivityGroup[] = [
  {
    label: "Today",
    events: [
      {
        id: "e-1",
        actor: "Ava Chen",
        action: "merged pull request #482 into main",
        time: "10:24",
        icon: GitCommitIcon,
        tone: "primary",
      },
      {
        id: "e-2",
        actor: "Deploy bot",
        action: "shipped v2.4.0 to production",
        time: "10:31",
        icon: UploadSimpleIcon,
        tone: "success",
      },
      {
        id: "e-3",
        actor: "Marcus Lee",
        action: "commented on “Empty states audit”",
        time: "11:02",
        icon: ChatCircleIcon,
        tone: "muted",
      },
    ],
  },
  {
    label: "Yesterday",
    events: [
      {
        id: "e-4",
        actor: "Priya Nair",
        action: "closed issue #471 as resolved",
        time: "16:48",
        icon: CheckCircleIcon,
        tone: "success",
      },
      {
        id: "e-5",
        actor: "Ava Chen",
        action: "tagged release candidate v2.4.0-rc1",
        time: "14:12",
        icon: TagIcon,
        tone: "muted",
      },
    ],
  },
  {
    label: "Jun 14",
    events: [
      {
        id: "e-6",
        actor: "System",
        action: "invited Jordan Blake to the workspace",
        time: "09:05",
        icon: UserPlusIcon,
        tone: "primary",
      },
    ],
  },
];

const TONE_CLASS: Record<ActivityEvent["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  muted: "bg-muted text-muted-foreground",
};

function TimelineDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Timeline / activity feed
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A reverse-chronological activity feed grouped by day. Each event sits
          on a vertical line with an icon dot, an actor, an action, and a time.
        </p>
      </div>

      <div className="max-w-xl">
        {GROUPS.map((group) => (
          <Fragment key={group.label}>
            <div className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {group.label}
            </div>
            <ol className="relative mb-6 flex flex-col gap-5 border-l border-border pl-6">
              {group.events.map((event) => {
                const EventIcon = event.icon;
                return (
                  <li key={event.id} className="relative">
                    <span
                      className={`absolute -left-[33px] flex size-6 items-center justify-center rounded-full ring-4 ring-background ${TONE_CLASS[event.tone]}`}
                    >
                      <EventIcon className="size-3.5" weight="bold" />
                    </span>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{event.actor}</span>{" "}
                        <span className="text-muted-foreground">
                          {event.action}
                        </span>
                      </p>
                      <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {event.time}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
