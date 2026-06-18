"use client";

import { BellIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const NOTIFICATIONS = [
  {
    id: "1",
    title: "New team signup",
    description: "Sarah Connor just joined the workspace.",
    time: "2 minutes ago",
  },
  {
    id: "2",
    title: "Deployment successful",
    description: "Dashboard v2.3 was deployed to production.",
    time: "25 minutes ago",
  },
  {
    id: "3",
    title: "Payments report ready",
    description: "Your weekly revenue report is available to download.",
    time: "1 hour ago",
  },
];

export function NotificationButton() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-none"
            aria-label="Open notifications"
          >
            <BellIcon size={22} className="size-5 text-muted-foreground" />
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-none bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              3
            </span>
          </Button>
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 space-x-2">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <span className="text-xs text-muted-foreground">3 new</span>
        </div>
        <div className="space-y-2 border-t border-border px-4 py-3">
          {NOTIFICATIONS.map((notification) => (
            <div
              key={notification.id}
              className="rounded-none border border-border bg-card p-3 text-left transition-colors hover:border-primary/40"
            >
              <p className="text-sm font-medium text-foreground">
                {notification.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {notification.description}
              </p>
              <span className="mt-2 block text-[11px] font-medium uppercase tracking-wide text-primary">
                {notification.time}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
