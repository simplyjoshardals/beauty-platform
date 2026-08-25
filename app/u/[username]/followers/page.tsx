import { notFound } from "next/navigation";
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
  fetchUserProfileForSSR,
  fetchFollowersForSSR,
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
//
// fetchFollowersForSSR returns each row's isFollowing/followsMe already
// computed (batched, server-side — see lib/users.ts's getFollowersList),
// so the follow buttons are correct on first paint instead of flashing
// Follow-then-Following — no separate per-row profile prefetch needed
// for that anymore (contrast with app/(home)/page.tsx's post-author
// batch prefetch, which is solving a different problem: those rows
// don't come from a relationship-list endpoint at all).
export default async function UserFollowersPage({ params }: Props) {
  const { username } = await params;
  const viewerId = await getServerUserId();

  const profile = await fetchUserProfileForSSR(username, viewerId);
  if (!profile) {
    notFound();
  }

  const queryClient = new QueryClient();

  if (viewerId) {
    const followers = await fetchFollowersForSSR(username, viewerId);
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
