import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { ExploreFeed } from "@/components/explore/ExploreFeed";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { EXPLORE_QUERY_KEY } from "@/lib/queryKeys";
import { getServerUserId } from "@/lib/session";
import { fetchExplorePostsForSSR } from "@/lib/serverQueries";

// Mirrors app/(home)/page.tsx's SSR shape: resolve the viewer, run the
// feed's own query server-side (getExploreFeedPosts via
// fetchExplorePostsForSSR — a dedicated hot-ranked query, not a filtered
// slice of Home's feed), and hydrate the client straight into real data
// instead of the old client-only page's fake loading timer over mock
// posts. Search-by-people is ExploreFeed's own concern — it now hits a
// real GET /api/explore/users endpoint (see useExploreUserSearch), not
// SSR-prefetched here since it's empty until the visitor types.
export default async function ExplorePage() {
  const userId = await getServerUserId();
  const posts = await fetchExplorePostsForSSR(userId);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: EXPLORE_QUERY_KEY,
    queryFn: async () => posts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequireAuth>
        <ExploreFeed />
      </RequireAuth>
    </HydrationBoundary>
  );
}
