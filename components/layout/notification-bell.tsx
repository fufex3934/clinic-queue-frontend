"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  Info,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/contexts/notifications-provider";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationKind } from "@/types/notification";

const kindIcon: Record<
  NotificationKind,
  typeof Info
> = {
  info: Info,
  success: CircleCheck,
  warning: CircleAlert,
};

const kindStyles: Record<NotificationKind, string> = {
  info: "bg-cyan-50 text-cyan-700",
  success: "bg-teal-50 text-teal-700",
  warning: "bg-amber-50 text-amber-800",
};

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationRow({
  item,
  onOpen,
}: {
  item: AppNotification;
  onOpen: (item: AppNotification) => void;
}) {
  const Icon = kindIcon[item.kind];

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={cn(
        "flex w-full gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/80",
        !item.read && "bg-primary/5",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
          kindStyles[item.kind],
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium leading-snug">{item.title}</span>
          {!item.read ? (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          ) : null}
        </span>
        {item.description ? (
          <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {item.description}
          </span>
        ) : null}
        <span className="mt-1 block text-[0.65rem] text-muted-foreground">
          {formatRelativeTime(item.createdAt)}
        </span>
      </span>
    </button>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    clearAll,
  } = useNotifications();

  const handleOpenItem = (item: AppNotification) => {
    markRead(item.id);
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <Popover
      onOpenChange={(open) => {
        if (open && unreadCount > 0) {
          markAllRead();
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "Notifications"
            }
            className="relative"
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-semibold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner side="bottom" align="end" className="z-50">
          <PopoverPopup className="w-[min(22rem,calc(100vw-2rem))]">
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              <p className="text-sm font-semibold">Notifications</p>
              <div className="flex items-center gap-0.5">
                {notifications.length > 0 ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Mark all as read"
                      title="Mark all as read"
                      onClick={markAllRead}
                    >
                      <CheckCheck className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Clear all notifications"
                      title="Clear all"
                      onClick={clearAll}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto p-1">
              {notifications.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No notifications yet. Live updates for payments, queue, and
                  appointments will appear here.
                </p>
              ) : (
                notifications.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onOpen={handleOpenItem}
                  />
                ))
              )}
            </div>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}
