import { notFound } from "next/navigation";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { UserProfileView } from "@/components/profile/UserProfileView";
import { profileQueryKey, USER_POSTS_QUERY_KEY } from "@/lib/queryKeys";
import { getServerUserId } from "@/lib/session";
import {
  fetchUserProfileForSSR,
  fetchUserPostsForSSR,
} from "@/lib/serverQueries";

type Props = {
  params: Promise<{ username: string }>;
};

// Mirrors app/(home)/page.tsx and app/profile/page.tsx's SSR-prefetch
// pattern. Unlike /profile, nothing here was prefetched before — this
// page was entirely client-fetched, so both the profile lookup and the
// nonexistent-username 404 used to happen after mount (a real GET
// request the browser had to make and wait on before the header, or
// the not-found screen, could show at all). Both now run on the server:
// the 404 is real (app/u/[username]/not-found.tsx renders from the
// server response, not a client-side check-after-load), and a valid
// profile + its posts are already hydrated by the time UserProfileView
// renders, so isFollowing/followsMe and the post count are correct on
// first paint instead of arriving in two separate pops.
//
// The "redirect to /profile if this is you" check still has to happen
// client-side in UserProfileView — it depends on the VIEWER's live
// useCurrentUser() session, which this Server Component doesn't (and
// shouldn't) assume matches the x-user-id on this particular request
// forever. Prefetching the profile here just means that redirect no
// longer has a skeleton flash in front of it either.
export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const viewerId = await getServerUserId();

  const [profile, posts] = await Promise.all([
    fetchUserProfileForSSR(username, viewerId),
    fetchUserPostsForSSR(username),
  ]);

  if (!profile) {
    notFound();
  }

  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: profileQueryKey(username),
      queryFn: async () => profile,
    }),
    queryClient.prefetchQuery({
      queryKey: USER_POSTS_QUERY_KEY(username),
      queryFn: async () => posts,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserProfileView username={username} />
    </HydrationBoundary>
  );
}
