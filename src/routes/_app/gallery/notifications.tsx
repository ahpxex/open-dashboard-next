import { ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  type Notification,
  NotificationCenter,
  type NotificationKind,
  useNotifications,
} from "@/components/NotificationCenter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/gallery/notifications")({
  component: NotificationsDemo,
});

const MINUTE = 60_000;

// Seeded relative to now so the relative-time labels read naturally.
function seed(): Notification[] {
  const now = Date.now();
  return [
    {
      id: "seed-1",
      kind: "success",
      title: "Order #1043 shipped",
      body: "Tracking number was emailed to the customer.",
      createdAt: now - 2 * MINUTE,
      read: false,
    },
    {
      id: "seed-2",
      kind: "message",
      title: "Marcus mentioned you",
      body: "“Can you take a look at the empty-states audit?”",
      createdAt: now - 18 * MINUTE,
      read: false,
    },
    {
      id: "seed-3",
      kind: "warning",
      title: "Payment retry failed",
      body: "Card on file for Acme Co was declined twice.",
      createdAt: now - 95 * MINUTE,
      read: false,
    },
    {
      id: "seed-4",
      kind: "info",
      title: "Weekly report is ready",
      body: "Your Monday digest has been generated.",
      createdAt: now - 26 * 60 * MINUTE,
      read: true,
    },
  ];
}

// A small pool the "Simulate event" button draws from.
const EVENTS: { kind: NotificationKind; title: string; body: string }[] = [
  {
    kind: "success",
    title: "New sign-up",
    body: "jordan@example.com just created an account.",
  },
  {
    kind: "info",
    title: "Backup completed",
    body: "Nightly database backup finished without errors.",
  },
  {
    kind: "warning",
    title: "Disk usage high",
    body: "Storage is at 86% on the primary node.",
  },
  {
    kind: "message",
    title: "New comment",
    body: "Priya replied on ticket #471.",
  },
];

function NotificationsDemo() {
  const { notifications, unreadCount, push, markRead, markAllRead } =
    useNotifications(seed());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Notification center
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A bell with an unread-count badge that opens a popover feed. Each item
          shows an icon, title, body, relative time, and an unread dot. Click an
          item to mark it read, or use “Mark all read”. The bell here lives in a
          mock header — drop it into the real app header the same way.
        </p>
      </div>

      {/* Mock app header to show where the bell belongs. */}
      <div className="flex items-center justify-between border border-border bg-card px-4 py-2.5">
        <span className="text-sm font-medium text-foreground">Dashboard</span>
        <div className="flex items-center gap-1">
          <NotificationCenter
            notifications={notifications}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            push(EVENTS[Math.floor(Math.random() * EVENTS.length)])
          }
        >
          <ArrowsClockwiseIcon />
          Simulate event
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {notifications.length} total · {unreadCount} unread
        </span>
      </div>
    </div>
  );
}
