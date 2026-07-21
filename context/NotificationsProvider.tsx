"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Notification } from "@/types/notification";
import { mockNotifications } from "@/data/mockNotifications";

type NotificationsContextValue = {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      // Bail out to the exact same reference if nothing changed — makes
      // this safe to call repeatedly (e.g. from an effect) without
      // triggering needless re-renders in every consumer of this context.
      if (prev.every((n) => n.read)) return prev;
      return prev.map((n) => ({ ...n, read: true }));
    });
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo(
    () => ({ notifications, unreadCount, markAllAsRead }),
    [notifications, unreadCount, markAllAsRead],
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
    throw new Error(
      "useNotifications must be used within a NotificationsProvider",
    );
  }
  return ctx;
}
