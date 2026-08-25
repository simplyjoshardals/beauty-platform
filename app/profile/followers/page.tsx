import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { FollowersListSection } from "@/components/profile/FollowersListSection";
import { followersQueryKey } from "@/lib/queryKeys";
import { getServerUserId } from "@/lib/session";
import {
  fetchCurrentUserForSSR,
  fetchFollowersForSSR,
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
// entry a fresh client mount is guaranteed to agree with.
// fetchFollowersForSSR now returns each row's isFollowing/followsMe
// already computed (batched, server-side — see lib/users.ts's
// getFollowersList), so the follow buttons render correctly on first
// paint instead of flashing "Follow" before settling on "Following" —
// no separate per-row profile prefetch needed for that anymore.
export default async function FollowersPage() {
  const userId = await getServerUserId();
  const currentUser = userId ? await fetchCurrentUserForSSR(userId) : null;
  const username = currentUser?.username;

  const queryClient = new QueryClient();

  if (username && userId) {
    const followers = await fetchFollowersForSSR(username, userId);
    await queryClient.prefetchQuery({
      queryKey: followersQueryKey(username, ""),
      queryFn: async () => followers,
    });
  }

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
