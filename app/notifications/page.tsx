import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { NotificationsListContent } from "@/components/notifications/NotificationsListContent";
import { NotificationsHeader } from "@/components/notifications/NotificationsHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { NOTIFICATIONS_QUERY_KEY, profileQueryKey } from "@/lib/queryKeys";
import { getServerUserId } from "@/lib/session";
import {
  fetchNotificationsForSSR,
  fetchUserProfilesBatchForSSR,
} from "@/lib/serverQueries";

// Single-tier SSR, same shape as app/saved/page.tsx: the whole page is
// awaited here before anything renders, and app/notifications/loading.tsx
// (Next's file-based streaming convention) is what shows in the
// meantime — no manual Suspense split needed inside the page itself.
export default async function NotificationsPage() {
  const userId = await getServerUserId();

  if (!userId) {
    // No session: RequireAuth below is what actually gates this page —
    // nothing to prefetch for a logged-out visitor.
    return (
      <RequireAuth>
        <div className="flex flex-col">
          <NotificationsHeader />
          <NotificationsListContent />
        </div>
      </RequireAuth>
    );
  }

  const notifications = await fetchNotificationsForSSR(userId);

  const queryClient = new QueryClient();
  const prefetches: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: NOTIFICATIONS_QUERY_KEY,
      queryFn: async () => notifications,
    }),
  ];

  // Batch-prefetch every "follow" notification's actor profile — same
  // fetchUserProfilesBatchForSSR call app/(home)/page.tsx already uses
  // for PostCard's follow button, for the same reason: without this,
  // NotificationRow's useUserProfile call starts with an empty cache
  // and has to fetch client-side, so the Follow button flashes its
  // default ("Follow back") before flipping to the real state (e.g.
  // "Friends") a beat later. Prefetching means it's already correct in
  // the initial HTML.
  const followActors = [
    ...new Set(
      notifications
        .filter((n) => n.type === "follow")
        .map((n) => n.actor.username),
    ),
  ];
  if (followActors.length > 0) {
    prefetches.push(
      fetchUserProfilesBatchForSSR(followActors, userId).then((profiles) => {
        for (const [username, profile] of profiles) {
          queryClient.setQueryData(profileQueryKey(username), profile);
        }
      }),
    );
  }

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequireAuth>
        <div className="flex flex-col">
          <NotificationsHeader />
          <NotificationsListContent />
        </div>
      </RequireAuth>
    </HydrationBoundary>
  );
}
