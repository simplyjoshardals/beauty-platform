"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import { NotificationsListSkeleton } from "@/components/notifications/NotificationsListSkeleton";
import { EmptyNotifications } from "@/components/notifications/EmptyNotifications";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function NotificationsPage() {
  const { notifications, markAllAsRead, isLoading } = useNotifications();

  // Option B, deliberately: the moment the real list first finishes
  // loading, freeze which ids were unread right then into
  // unreadIdsAtOpen, then optimistically mark everything read.
  // useNotifications' cache (and so the BottomNav badge) flips to
  // read/zero immediately — but this list keeps rendering its unread
  // dot/highlight off THIS frozen snapshot for the rest of the visit,
  // not off notification.read, so a notification that was unread when
  // you opened the page still looks unread while you're looking at it.
  // It's just plain component state, so it's naturally discarded when
  // this page unmounts — coming back later starts a fresh snapshot off
  // whatever's unread at that point.
  const [unreadIdsAtOpen, setUnreadIdsAtOpen] = useState<Set<string> | null>(
    null,
  );

  useEffect(() => {
    if (isLoading || unreadIdsAtOpen !== null) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    setUnreadIdsAtOpen(new Set(unreadIds));
    if (unreadIds.length > 0) {
      markAllAsRead();
    }
    // Deliberately only keyed on isLoading: this should capture exactly
    // once, the moment the real data first arrives, and never again for
    // the rest of this mount — a later background refetch/poll updating
    // `notifications` shouldn't reset the snapshot (the unreadIdsAtOpen
    // !== null guard above is what actually prevents that; isLoading is
    // just what triggers the first check).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <RequireAuth>
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
          <p className="text-sm font-medium">Notifications</p>
        </div>

        {isLoading ? (
          <NotificationsListSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          notifications.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              unread={unreadIdsAtOpen?.has(n.id) ?? false}
            />
          ))
        )}
      </div>
    </RequireAuth>
  );
}
