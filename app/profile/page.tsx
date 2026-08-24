import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { ProfileView } from "@/components/profile/ProfileView";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CURRENT_USER_QUERY_KEY, USER_POSTS_QUERY_KEY } from "@/lib/queryKeys";
import { getServerUserId } from "@/lib/session";
import {
  fetchCurrentUserForSSR,
  fetchUserPostsForSSR,
} from "@/lib/serverQueries";

// Mirrors app/(home)/page.tsx's SSR-prefetch pattern. currentUser itself
// is already prefetched once in app/layout.tsx for the shared chrome
// (BottomNav etc.) — fetchCurrentUserForSSR is wrapped in React's
// cache(), so calling it again here for the same userId within the same
// request dedupes to that one DB hit, not a second one. What's new here
// is prefetching this viewer's OWN posts, which previously only ever
// loaded client-side after mount — that's what used to leave the post
// count at 0 (and the grid skeleton showing) for a beat after the
// header had already rendered.
export default async function ProfilePage() {
  const userId = await getServerUserId();
  const queryClient = new QueryClient();

  if (!userId) {
    // No session: RequireAuth (inside ProfileView's tree, below) is
    // what actually gates this page — nothing to prefetch for a
    // logged-out visitor, just render straight through to it.
    return (
      <RequireAuth>
        <ProfileView />
      </RequireAuth>
    );
  }

  const currentUser = await fetchCurrentUserForSSR(userId);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: CURRENT_USER_QUERY_KEY,
      queryFn: async () => currentUser,
    }),
    currentUser
      ? queryClient.prefetchQuery({
          queryKey: USER_POSTS_QUERY_KEY(currentUser.username),
          queryFn: () => fetchUserPostsForSSR(currentUser.username),
        })
      : Promise.resolve(),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequireAuth>
        <ProfileView />
      </RequireAuth>
    </HydrationBoundary>
  );
}
