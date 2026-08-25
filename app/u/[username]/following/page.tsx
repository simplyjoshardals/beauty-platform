import { notFound } from "next/navigation";
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
  fetchUserProfileForSSR,
  fetchFollowingForSSR,
} from "@/lib/serverQueries";

type Props = {
  params: Promise<{ username: string }>;
};

// Mirrors app/u/[username]/followers/page.tsx exactly, just the reverse
// Follow direction — see that file's own comments for the full
// reasoning behind each piece:
//  - the profile lookup 404s server-side regardless of viewer auth,
//  - the list itself only prefetches when there's a viewer session
//    (RequireAuth is what actually gates it),
//  - only the unsearched page (followingQueryKey(username, "")) is
//    prefetched — the one cache entry FollowingListSection's fresh
//    mount is guaranteed to agree with,
//  - fetchFollowingForSSR returns each row's isFollowing/followsMe
//    already computed (batched, server-side — see lib/users.ts's
//    getFollowingList), so the follow buttons are correct on first
//    paint instead of flashing Follow-then-Following.
export default async function UserFollowingPage({ params }: Props) {
  const { username } = await params;
  const viewerId = await getServerUserId();

  const profile = await fetchUserProfileForSSR(username, viewerId);
  if (!profile) {
    notFound();
  }

  const queryClient = new QueryClient();

  if (viewerId) {
    const following = await fetchFollowingForSSR(username, viewerId);
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
