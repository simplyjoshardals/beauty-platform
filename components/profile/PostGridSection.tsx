import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { PostGridClient } from "@/components/profile/PostGridClient";
import { USER_POSTS_QUERY_KEY } from "@/lib/queryKeys";
import { fetchUserPostsForSSR } from "@/lib/serverQueries";

type Props = {
  username: string;
};

// Rendered inside a <Suspense fallback={<PostGridSkeleton />}> by both
// app/profile/page.tsx and app/u/[username]/page.tsx. This is
// deliberately the ONLY thing awaiting the posts-with-media query
// (author, carousel items, products, per-post like/comment counts) —
// the header above it already has everything it needs (including a
// real postCount) from the much cheaper profile lookup those pages run
// before this ever starts, so the header renders and streams to the
// client without waiting on this to resolve.
export async function PostGridSection({ username }: Props) {
  const posts = await fetchUserPostsForSSR(username);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: USER_POSTS_QUERY_KEY(username),
    queryFn: async () => posts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostGridClient username={username} />
    </HydrationBoundary>
  );
}
