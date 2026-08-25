"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, type CreatePostInput } from "@/services/postService";
import {
  POSTS_QUERY_KEY,
  EXPLORE_QUERY_KEY,
  USER_POSTS_QUERY_KEY_PREFIX,
  CURRENT_USER_QUERY_KEY,
} from "@/lib/queryKeys";

// Mirrors useCompleteOnboarding/useUpdateProfile: same
// mutate-then-invalidate pattern. A new post shows up in four separate
// caches — Home's feed, Explore's ranked feed, the author's own profile
// grid (USER_POSTS_QUERY_KEY_PREFIX — invalidated by prefix, same
// reasoning as useUpdateProfile, since this hook doesn't know the
// author's username without its own lookup), and currentUser's
// postCount (derived via _count, see lib/users.ts) — so all four get
// invalidated here instead of doing an optimistic local insert and
// letting the others silently drift stale.
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => createPost(data),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: EXPLORE_QUERY_KEY });
        queryClient.invalidateQueries({
          queryKey: USER_POSTS_QUERY_KEY_PREFIX,
        });
        queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      }
    },
  });
}
