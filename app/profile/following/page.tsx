import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { FollowingListSection } from "@/components/profile/FollowingListSection";
import { followingQueryKey } from "@/lib/queryKeys";
import { getServerUserId } from "@/lib/session";
import {
  fetchCurrentUserForSSR,
  fetchFollowingForSSR,
} from "@/lib/serverQueries";

// Mirrors app/profile/followers/page.tsx exactly, just the reverse
// Follow direction — see that file's own comments for the full
// reasoning: RequireAuth is what actually gates a logged-out visitor
// (so a null userId just skips the prefetch), and only the unsearched
// page is prefetched. fetchFollowingForSSR now returns each row's
// isFollowing/followsMe already computed (batched, server-side — see
// lib/users.ts's getFollowingList), so the follow buttons are correct
// on first paint without a separate per-row profile prefetch.
export default async function FollowingPage() {
  const userId = await getServerUserId();
  const currentUser = userId ? await fetchCurrentUserForSSR(userId) : null;
  const username = currentUser?.username;

  const queryClient = new QueryClient();

  if (username && userId) {
    const following = await fetchFollowingForSSR(username, userId);
    await queryClient.prefetchQuery({
      queryKey: followingQueryKey(username, ""),
      queryFn: async () => following,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequireAuth>
        <div className="flex flex-col">
          <div className="border-b border-foreground/10 px-4 py-3">
            <p className="text-sm font-medium">Following</p>
          </div>

          <FollowingListSection username={username} />
        </div>
      </RequireAuth>
    </HydrationBoundary>
  );
}
