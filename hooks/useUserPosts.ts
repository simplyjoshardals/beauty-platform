"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserPosts } from "@/services/postService";
import {
  USER_POSTS_QUERY_KEY,
  USER_POSTS_QUERY_KEY_PREFIX,
} from "@/lib/queryKeys";

// Re-exported for existing callers (post mutations invalidating by
// prefix) — the actual definition now lives in lib/queryKeys.ts so a
// Server Component (app/profile/page.tsx, app/u/[username]/page.tsx)
// can construct the exact same key for SSR prefetching without
// importing this "use client" file.
export { USER_POSTS_QUERY_KEY_PREFIX };

// Backs the post grid on both /profile and /u/[username] — a direct
// fetch of just this user's posts (see app/api/user/[username]/posts/route.ts)
// instead of pulling the whole feed via usePosts() and filtering it down
// to one author client-side. Undefined username (e.g. own profile before
// useCurrentUser resolves) just holds the query off via `enabled` rather
// than firing a request for "undefined".
export function useUserPosts(username: string | undefined) {
  const query = useQuery({
    queryKey: USER_POSTS_QUERY_KEY(username),
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
