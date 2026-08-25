"use client";

import { useQuery } from "@tanstack/react-query";
import { listExplorePosts } from "@/services/postService";
import { EXPLORE_QUERY_KEY } from "@/lib/queryKeys";

// Backs the discovery grid on /explore — GET /api/explore (a dedicated
// hot-ranked query, see getExploreFeedPosts in lib/posts.ts), not
// usePosts() filtered client-side. Same shape/posture as useUserPosts:
// a live query subscription so a later mutation elsewhere that
// invalidates EXPLORE_QUERY_KEY has something to refetch into, but on a
// fresh page load app/explore/page.tsx has already hydrated this from
// SSR, so isLoading is false immediately.
export function useExplorePosts() {
  const query = useQuery({
    queryKey: EXPLORE_QUERY_KEY,
    queryFn: async () => {
      const result = await listExplorePosts();
      if (!result?.success) return [];
      return result.posts;
    },
  });

  return {
    posts: query.data ?? [],
    isLoading: query.isLoading,
  };
}
