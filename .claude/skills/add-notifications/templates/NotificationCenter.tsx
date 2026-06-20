import type { Icon } from "@phosphor-icons/react";
import {
  BellIcon,
  ChatCircleIcon,
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * In-app notification center: a bell button with an unread-count badge that
 * opens a popover feed. The component is **presentational + controlled** — it
 * renders a passed `notifications` array and calls back on read actions, so it
 * works against any backend (a real notifications resource, a websocket, etc.).
 * For standalone / demo use, `useNotifications` below provides a local store.
 */

export type NotificationKind = "info" | "success" | "warning" | "message";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  /** Epoch ms — used to render relative time and to sort newest-first. */
  createdAt: number;
  read: boolean;
}

const KIND_ICON: Record<NotificationKind, Icon> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  message: ChatCircleIcon,
};

const KIND_CLASS: Record<NotificationKind, string> = {
  info: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  message: "bg-muted text-muted-foreground",
};

/** Compact "2m ago" / "3h ago" / "Jun 12" relative time from an epoch ms. */
export function relativeTime(from: number, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - from) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(from).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  /** Optional empty-feed copy. */
  emptyMessage?: string;
  /** Cap the unread badge (e.g. "9+"). Default 9. */
  badgeCap?: number;
  className?: string;
}

export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  emptyMessage = "You're all caught up.",
  badgeCap = 9,
  className,
}: NotificationCenterProps) {
  const unread = notifications.filter((n) => !n.read).length;
  const ordered = useMemo(
    () => [...notifications].sort((a, b) => b.createdAt - a.createdAt),
    [notifications],
  );

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
            }
            className={cn("relative", className)}
          />
        }
      >
        <BellIcon weight={unread > 0 ? "fill" : "regular"} />
        {unread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground tabular-nums">
            {unread > badgeCap ? `${badgeCap}+` : unread}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-0 p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <span className="text-sm font-medium text-foreground">
            Notifications
          </span>
          <Button
            variant="link"
            size="xs"
            disabled={unread === 0}
            onClick={onMarkAllRead}
            className="h-auto px-0"
          >
            Mark all read
          </Button>
        </div>

        {ordered.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {ordered.map((item) => {
              const ItemIcon = KIND_ICON[item.kind];
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => !item.read && onMarkRead(item.id)}
                    className={cn(
                      "flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
                      item.read ? "opacity-70" : undefined,
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full",
                        KIND_CLASS[item.kind],
                      )}
                    >
                      <ItemIcon className="size-3.5" weight="bold" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-medium text-foreground">
                          {item.title}
                        </span>
                        {!item.read ? (
                          <span
                            aria-hidden
                            className="size-1.5 shrink-0 rounded-full bg-primary"
                          />
                        ) : null}
                      </span>
                      {item.body ? (
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {item.body}
                        </span>
                      ) : null}
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {relativeTime(item.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

let seq = 0;
const nextId = () => `n-${Date.now().toString(36)}-${(seq++).toString(36)}`;

/** New-notification payload: everything but the generated `id`/`read` flag. */
export type NewNotification = Omit<Notification, "id" | "read" | "createdAt"> &
  Partial<Pick<Notification, "createdAt">>;

/**
 * Local in-memory store for standalone use (demos, prototypes, or before a real
 * notifications resource exists). Swap this out for a query + mutation pair when
 * notifications are persisted server-side — `NotificationCenter` doesn't change.
 */
export function useNotifications(seed: Notification[] = []) {
  const [notifications, setNotifications] = useState<Notification[]>(seed);

  const push = useCallback((input: NewNotification) => {
    // Order is by createdAt (NotificationCenter re-sorts desc); array position
    // is irrelevant — prepend here is just a convention.
    setNotifications((prev) => [
      {
        createdAt: Date.now(),
        ...input,
        id: nextId(),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.reduce((n, x) => n + (x.read ? 0 : 1), 0);

  return { notifications, unreadCount, push, markRead, markAllRead };
}
