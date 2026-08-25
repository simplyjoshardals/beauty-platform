import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { FollowersListSection } from "@/components/profile/FollowersListSection";
import { followersQueryKey, profileQueryKey } from "@/lib/queryKeys";
import { getServerUserId } from "@/lib/session";
import {
  fetchCurrentUserForSSR,
  fetchFollowersForSSR,
  fetchUserProfilesBatchForSSR,
} from "@/lib/serverQueries";

// Same posture as app/saved/page.tsx for a logged-out visitor: RequireAuth
// below is what actually gates this page, so a null userId just skips
// the prefetch entirely — FollowersListSection is still rendered (with
// username undefined, which keeps useFollowersList's query disabled),
// but RequireAuth swaps it for the sign-in gate before it'd ever fetch
// anything.
//
// Only the unsearched page (followersQueryKey(username, "")) is
// prefetched — see the identical comment on
// app/u/[username]/followers/page.tsx for why that's the one cache
// entry a fresh client mount is guaranteed to agree with. Each row's
// own profile (isFollowing/followsMe — see UserListRow's
// useUserProfile call) is batch-prefetched too, same as that page, so
// the follow buttons render correctly on first paint instead of
// flashing "Follow" before settling on "Following".
export default async function FollowersPage() {
  const userId = await getServerUserId();
  const currentUser = userId ? await fetchCurrentUserForSSR(userId) : null;
  const username = currentUser?.username;

  const queryClient = new QueryClient();
  const prefetches: Promise<unknown>[] = [];

  if (username && userId) {
    const followers = await fetchFollowersForSSR(username);
    prefetches.push(
      queryClient.prefetchQuery({
        queryKey: followersQueryKey(username, ""),
        queryFn: async () => followers,
      }),
    );

    const followerUsernames = [...new Set(followers.map((f) => f.username))];
    if (followerUsernames.length > 0) {
      prefetches.push(
        fetchUserProfilesBatchForSSR(followerUsernames, userId).then(
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
            <p className="text-sm font-medium">Followers</p>
          </div>

          <FollowersListSection username={username} />
        </div>
      </RequireAuth>
    </HydrationBoundary>
  );
}
