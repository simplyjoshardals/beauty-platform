import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { HomeFeed } from "@/components/feed/HomeFeed";
import { RequireAuth } from "@/components/auth/RequireAuth";
import {
  POSTS_QUERY_KEY,
  LIKES_QUERY_KEY,
  SAVED_QUERY_KEY,
  followingQueryKey,
  profileQueryKey,
} from "@/lib/queryKeys";
import { getServerUserId } from "@/lib/session";
import {
  fetchPostsForSSR,
  fetchLikedPostIdsForSSR,
  fetchSavedBundleForSSR,
  fetchFollowingForSSR,
  fetchUserProfilesBatchForSSR,
  fetchCurrentUserForSSR,
} from "@/lib/serverQueries";

export default async function HomeFeedPage() {
  const pageStart = performance.now();

  const userId = await getServerUserId();

  const [currentUser, posts] = await Promise.all([
    userId ? fetchCurrentUserForSSR(userId) : Promise.resolve(null),
    fetchPostsForSSR(userId),
  ]);

  const viewer = currentUser
    ? { id: currentUser.id, username: currentUser.username }
    : null;
  const queryClient = new QueryClient();

  const prefetches: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: POSTS_QUERY_KEY,
      queryFn: async () => posts,
    }),
  ];

  if (viewer) {
    prefetches.push(
      timed("likes", () =>
        queryClient.prefetchQuery({
          queryKey: LIKES_QUERY_KEY,
          queryFn: async () => ({
            likedPostIds: await fetchLikedPostIdsForSSR(viewer.id),
          }),
        }),
      ),
      timed("saved", () =>
        queryClient.prefetchQuery({
          queryKey: SAVED_QUERY_KEY,
          queryFn: () => fetchSavedBundleForSSR(viewer.id),
        }),
      ),
      timed("following", () =>
        queryClient.prefetchQuery({
          queryKey: followingQueryKey(viewer.username),
          queryFn: () => fetchFollowingForSSR(viewer.username, viewer.id),
        }),
      ),
    );
  }

  const authors = [...new Set(posts.map((p) => p.author.username))];
  if (viewer) {
    prefetches.push(
      timed(`profiles batch (${authors.length} authors)`, () =>
        fetchUserProfilesBatchForSSR(authors, viewer.id).then((profiles) => {
          for (const [username, profile] of profiles) {
            queryClient.setQueryData(profileQueryKey(username), profile);
          }
        }),
      ),
    );
  }

  const prefetchStart = performance.now();
  await Promise.all(prefetches);
  console.log(
    `[home] Promise.all total: ${(performance.now() - prefetchStart).toFixed(1)}ms`,
  );
  console.log(
    `[home] full page function: ${(performance.now() - pageStart).toFixed(1)}ms`,
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequireAuth>
        <div className="min-h-dvh">
          <HomeFeed />
        </div>
      </RequireAuth>
    </HydrationBoundary>
  );
}

async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  console.log(`[home] ${label}: ${(performance.now() - start).toFixed(1)}ms`);
  return result;
}
