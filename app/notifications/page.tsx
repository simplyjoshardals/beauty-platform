"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/context/NotificationsProvider";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import { NotificationsListSkeleton } from "@/components/notifications/NotificationsListSkeleton";
import { EmptyNotifications } from "@/components/notifications/EmptyNotifications";

// Simulated so the skeleton is actually visible — swap for a real pending
// flag once notifications come from a real fetch.
const SIMULATED_LOAD_MS = 800;

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), SIMULATED_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
        <p className="text-sm font-medium">Notifications</p>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-xs font-medium text-foreground/60"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <NotificationsListSkeleton />
      ) : notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        notifications.map((n) => (
          <NotificationRow key={n.id} notification={n} />
        ))
      )}
    </div>
  );
}
