"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserPosts } from "@/services/postService";

// Shared prefix so a post mutation elsewhere (create, delete, like,
// comment — see usePosts/useCreatePost/useLikedPosts/useComments) can
// invalidate every per-user posts query at once without knowing which
// usernames are actually cached. React Query's invalidateQueries matches
// by prefix, so passing this alone (no username) hits every
// ["userPosts", username] entry in the cache.
export const USER_POSTS_QUERY_KEY_PREFIX = ["userPosts"] as const;

// Backs the post grid on both /profile and /u/[username] — a direct
// fetch of just this user's posts (see app/api/user/[username]/posts/route.ts)
// instead of pulling the whole feed via usePosts() and filtering it down
// to one author client-side. Undefined username (e.g. own profile before
// useCurrentUser resolves) just holds the query off via `enabled` rather
// than firing a request for "undefined".
export function useUserPosts(username: string | undefined) {
  const query = useQuery({
    queryKey: [...USER_POSTS_QUERY_KEY_PREFIX, username],
    queryFn: async () => {
      const result = await getUserPosts(username as string);
      if (!result?.success) return [];
      return result.posts;
    },
    enabled: Boolean(username),
  });

  return {
    posts: query.data ?? [],
    isLoading: query.isLoading,
  };
}
