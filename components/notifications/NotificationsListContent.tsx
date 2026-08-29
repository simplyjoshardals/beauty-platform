"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import { NotificationsListSkeleton } from "@/components/notifications/NotificationsListSkeleton";
import { EmptyNotifications } from "@/components/notifications/EmptyNotifications";

// Extracted from app/notifications/page.tsx so the page can be a
// Server Component that prefetches NOTIFICATIONS_QUERY_KEY (see
// lib/serverQueries.ts's fetchNotificationsForSSR) and hand this a
// pre-warmed cache via HydrationBoundary — same split as
// SavedGridContent/app/saved/page.tsx. This is deliberately just the
// list (no header bar) — the header is static and needs no data, so
// page.tsx (and its loading.tsx sibling) render NotificationsHeader
// directly, outside of anything that depends on this data.
export function NotificationsListContent() {
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
    // just what triggers the first check). The SSR prefetch has already
    // resolved by the time this mounts, so isLoading is false on the
    // very first render — this effect still fires once on mount either
    // way.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (isLoading) {
    return <NotificationsListSkeleton />;
  }

  if (notifications.length === 0) {
    return <EmptyNotifications />;
  }

  return (
    <>
      {notifications.map((n) => (
        <NotificationRow
          key={n.id}
          notification={n}
          unread={unreadIdsAtOpen?.has(n.id) ?? false}
        />
      ))}
    </>
  );
}
