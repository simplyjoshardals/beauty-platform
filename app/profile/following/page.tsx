import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { FollowingListSection } from "@/components/profile/FollowingListSection";
import { followingQueryKey, profileQueryKey } from "@/lib/queryKeys";
import { getServerUserId } from "@/lib/session";
import {
  fetchCurrentUserForSSR,
  fetchFollowingForSSR,
  fetchUserProfilesBatchForSSR,
} from "@/lib/serverQueries";

// Mirrors app/profile/followers/page.tsx exactly, just the reverse
// Follow direction — see that file's own comments for the full
// reasoning: RequireAuth is what actually gates a logged-out visitor
// (so a null userId just skips the prefetch), only the unsearched page
// is prefetched, and every visible row's own profile is batch-prefetched
// too so follow buttons don't flash Follow-then-Following.
export default async function FollowingPage() {
  const userId = await getServerUserId();
  const currentUser = userId ? await fetchCurrentUserForSSR(userId) : null;
  const username = currentUser?.username;

  const queryClient = new QueryClient();
  const prefetches: Promise<unknown>[] = [];

  if (username && userId) {
    const following = await fetchFollowingForSSR(username);
    prefetches.push(
      queryClient.prefetchQuery({
        queryKey: followingQueryKey(username, ""),
        queryFn: async () => following,
      }),
    );

    const followingUsernames = [...new Set(following.map((f) => f.username))];
    if (followingUsernames.length > 0) {
      prefetches.push(
        fetchUserProfilesBatchForSSR(followingUsernames, userId).then(
          (profiles) => {
            for (const [rowUsername, rowProfile] of profiles) {
              queryClient.setQueryData(
                profileQueryKey(rowUsername),
                rowProfile,
              );
            }
          },
        ),
      );
    }
  }

  await Promise.all(prefetches);

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
