"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-provider";
import type {
  AppNotification,
  PushNotificationInput,
} from "@/types/notification";

const MAX_NOTIFICATIONS = 50;
const STORAGE_PREFIX = "clinic-notifications";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function loadStored(userId: string): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(userId: string, items: AppNotification[]) {
  localStorage.setItem(
    storageKey(userId),
    JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)),
  );
}

type NotificationsContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  push: (input: PushNotificationInput) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    setNotifications(loadStored(userId));
  }, [userId]);

  const commit = useCallback(
    (updater: (prev: AppNotification[]) => AppNotification[]) => {
      if (!userId) return;
      setNotifications((prev) => {
        const next = updater(prev).slice(0, MAX_NOTIFICATIONS);
        persist(userId, next);
        return next;
      });
    },
    [userId],
  );

  const push = useCallback(
    (input: PushNotificationInput) => {
      if (!userId) return;
      const item: AppNotification = {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        kind: input.kind,
        href: input.href,
        createdAt: Date.now(),
        read: false,
      };
      commit((prev) => [item, ...prev]);
    },
    [commit, userId],
  );

  const markRead = useCallback(
    (id: string) => {
      commit((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
    [commit],
  );

  const markAllRead = useCallback(() => {
    commit((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [commit]);

  const clearAll = useCallback(() => {
    commit(() => []);
  }, [commit]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      push,
      markRead,
      markAllRead,
      clearAll,
    }),
    [notifications, unreadCount, push, markRead, markAllRead, clearAll],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
