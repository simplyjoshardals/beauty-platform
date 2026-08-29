import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { NotificationsListContent } from "@/components/notifications/NotificationsListContent";
import { NOTIFICATIONS_QUERY_KEY } from "@/lib/queryKeys";
import { fetchNotificationsForSSR } from "@/lib/serverQueries";

type Props = {
  userId: string | null;
};

// Rendered inside a <Suspense fallback={<NotificationsListSkeleton />}>
// by app/notifications/page.tsx — same pattern as
// components/profile/PostGridSection.tsx. This is deliberately the ONLY
// thing awaiting the DB query; the page's static header has everything
// it needs already, so it renders and streams to the client immediately
// instead of sitting blank while this resolves.
export async function NotificationsSection({ userId }: Props) {
  if (!userId) {
    // No session — nothing to prefetch. RequireAuth (rendered by the
    // page, above this) is what actually handles a logged-out visit;
    // this just avoids calling fetchNotificationsForSSR with no id.
    return <NotificationsListContent />;
  }

  const notifications = await fetchNotificationsForSSR(userId);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => notifications,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsListContent />
    </HydrationBoundary>
  );
}
