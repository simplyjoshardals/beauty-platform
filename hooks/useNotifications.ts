"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@/types/notification";
import {
  getNotifications,
  markAllNotificationsRead,
} from "@/services/notificationService";
import { NOTIFICATIONS_QUERY_KEY } from "@/lib/queryKeys";

export { NOTIFICATIONS_QUERY_KEY };

// Independent of the app's global 1-minute staleTime (see
// app/providers.tsx) — the BottomNav badge needs to notice a new
// notification much sooner than feeds/profiles need to refresh.
// refetchOnWindowFocus/refetchOnReconnect (also global defaults) already
// catch the "came back to the tab" case instantly; this interval is
// just for "left the tab open and idle." 8s keeps a genuinely idle tab
// feeling near-live without the request volume 1s polling would mean
// (that's 10x fewer requests per idle hour than a 1s interval, for a
// worst-case wait that's still under 10 seconds).
const NOTIFICATIONS_REFETCH_INTERVAL_MS = 8 * 1000;

// apiFetch never throws on a failed request (see utils/apiClient.ts) —
// same reasoning as useSavedPosts.ts's mutationFailed.
function mutationFailed(result: { success: boolean } | undefined) {
  return result === undefined || !result.success;
}

// Replaces context/NotificationsProvider.tsx's mock-data context. Same
// public shape (notifications, unreadCount, markAllAsRead) so BottomNav
// and the notifications page both keep working with just an import-path
// change — and because both call this same hook, they read off the
// exact same React Query cache entry (NOTIFICATIONS_QUERY_KEY) and can
// never show conflicting read state. No provider wrapping needed, same
// as useSavedPosts/useLikedPosts: react-query already dedupes/shares
// this cache across every component that calls the hook.
export function useNotifications(enabled: boolean = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async (): Promise<Notification[]> => {
      const result = await getNotifications();
      if (!result?.success) return [];
      return result.notifications;
    },
    refetchInterval: NOTIFICATIONS_REFETCH_INTERVAL_MS,
    // BottomNav calls this on every page, logged in or not — no point
    // fetching (or polling every 25s) for a visitor who isn't
    // authenticated in the first place.
    enabled,
  });

  const notifications = useMemo(() => query.data ?? [], [query.data]);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  // Same optimistic-update / snapshot / rollback-or-refetch pattern as
  // useSavedPosts.ts and useLikedPosts.ts throughout. There's no
  // per-notification variant of this mutation — see
  // app/api/notifications/read-all/route.ts.
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<Notification[]>(
        NOTIFICATIONS_QUERY_KEY,
      );
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
        (old ?? []).map((n) => (n.read ? n : { ...n, read: true })),
      );
      return { previous };
    },
    onSettled: (result, _error, _vars, context) => {
      if (mutationFailed(result)) {
        if (context?.previous) {
          queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
        }
      } else {
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      }
    },
  });

  function markAllAsRead() {
    markAllAsReadMutation.mutate();
  }

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    isLoading: query.isLoading,
  };
}
