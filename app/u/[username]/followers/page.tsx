import { notFound } from "next/navigation";
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
  fetchUserProfileForSSR,
  fetchFollowersForSSR,
  fetchUserProfilesBatchForSSR,
} from "@/lib/serverQueries";

type Props = {
  params: Promise<{ username: string }>;
};

// Same two-tier SSR posture as app/u/[username]/page.tsx: the profile
// lookup (public, cheap — same lib/users.ts row GET /api/user/[username]
// runs) is awaited here so a nonexistent username produces a real
// server-side 404 regardless of the viewer's auth state. The followers
// list itself stays gated behind RequireAuth — this route (and its API)
// requires a session no matter whose followers are being viewed — so
// it's only ever prefetched when there IS a viewer session; a logged-out
// visitor still gets the correct 404 check but sees the sign-in gate in
// place of a list, same as the client-side version did.
//
// Only the unsearched page (followersQueryKey(username, "")) is
// prefetched — that's the one cache entry FollowersListSection's fresh
// mount (search state starting at "") is guaranteed to agree with, so
// the server-rendered list hydrates without an extra client fetch. Any
// search the visitor types after that runs as its own client-side fetch
// (see UserListWithSearch's server-search mode).
export default async function UserFollowersPage({ params }: Props) {
  const { username } = await params;
  const viewerId = await getServerUserId();

  const profile = await fetchUserProfileForSSR(username, viewerId);
  if (!profile) {
    notFound();
  }

  const queryClient = new QueryClient();
  const prefetches: Promise<unknown>[] = [];

  if (viewerId) {
    const followers = await fetchFollowersForSSR(username);
    prefetches.push(
      queryClient.prefetchQuery({
        queryKey: followersQueryKey(username, ""),
        queryFn: async () => followers,
      }),
    );

    // Same batch prefetch app/(home)/page.tsx does for post authors —
    // without this, each row's own useUserProfile(username) call (see
    // UserListRow) starts with nothing cached, so isFollowing/followsMe
    // default to false for a beat before that row's own fetch resolves:
    // a visible Follow-then-Following flash on every row that's
    // actually already followed. Prefetching all of them here means the
    // whole list — follow-button state included — is correct on the
    // very first paint, not just the usernames/avatars.
    const followerUsernames = [...new Set(followers.map((f) => f.username))];
    if (followerUsernames.length > 0) {
      prefetches.push(
        fetchUserProfilesBatchForSSR(followerUsernames, viewerId).then(
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
