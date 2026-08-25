"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/types/post";
import {
  listPosts,
  deletePost as deletePostRequest,
} from "@/services/postService";
import {
  POSTS_QUERY_KEY,
  EXPLORE_QUERY_KEY,
  USER_POSTS_QUERY_KEY_PREFIX,
  CURRENT_USER_QUERY_KEY,
} from "@/lib/queryKeys";

// Exported so hooks that mutate a post's derived counts from elsewhere
// (useLikedPosts' toggleLike, useComments' add/delete) can invalidate
// this cache too — a like/comment changes Post.likeCount/commentCount
// (both derived via _count, per prisma/schema.prisma) even though those
// hooks never touch POSTS_QUERY_KEY's data directly.
export { POSTS_QUERY_KEY };

// Replaces context/PostsProvider.tsx. Same query key, same shape — react-
// query already dedupes/shares the cache across every component that
// calls this, so HomeFeed and PostCard both calling usePosts() does NOT
// mean two separate fetches. No provider wrapping needed, which also
// means this only ever runs on pages that actually render one of those
// two components — not on every page in the app (that was what caused
// the /auth refresh-token 401 loop: PostsProvider used to sit in
// app/layout.tsx, so it fired on /auth too, on every logged-out load).
export function usePosts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: POSTS_QUERY_KEY,
    queryFn: async () => {
      const result = await listPosts();
      if (!result?.success) return [];
      return result.posts;
    },
  });

  const posts = query.data ?? [];

  // No-op passthrough — real creation goes through useCreatePost, which
  // already invalidates POSTS_QUERY_KEY on success and lets that refetch
  // put the new post into `posts`, instead of trusting a client-built
  // object as the source of truth.
  function addPost(_post: Post) {}

  // apiFetch never throws on a failed request — network errors, timeouts,
  // and non-2xx responses all resolve to a `{ success: false }` object
  // rather than rejecting (see utils/apiClient.ts and the same reasoning
  // in useSavedPosts.ts) — so failure has to be read off the resolved
  // result inside onSettled, not caught via onError.
  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => deletePostRequest(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: POSTS_QUERY_KEY });
      const previous = queryClient.getQueryData<Post[]>(POSTS_QUERY_KEY);
      queryClient.setQueryData<Post[]>(POSTS_QUERY_KEY, (prev) =>
        (prev ?? []).filter((p) => p.id !== postId),
      );
      return { previous };
    },
    onSettled: (result, _error, _postId, context) => {
      if (result === undefined || !result.success) {
        // Failed — put the removed post right back where it was rather
        // than leaving the feed silently short one item.
        if (context?.previous) {
          queryClient.setQueryData(POSTS_QUERY_KEY, context.previous);
        }
      } else {
        // Succeeded — the optimistic removal already matches server
        // state, but refetch anyway so the list is fully in sync (e.g.
        // with another post that became visible now this one's gone).
        // Same three sibling caches useCreatePost invalidates on the
        // way in also need to catch up on the way out — Explore's
        // ranked feed, the author's profile grid (by prefix — this hook
        // doesn't know the author's username without its own lookup),
        // and currentUser's postCount.
        queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: EXPLORE_QUERY_KEY });
        queryClient.invalidateQueries({
          queryKey: USER_POSTS_QUERY_KEY_PREFIX,
        });
        queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      }
    },
  });

  function deletePost(postId: string) {
    deletePostMutation.mutate(postId);
  }

  return { posts, isLoading: query.isLoading, addPost, deletePost };
}
