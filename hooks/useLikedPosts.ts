"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLikedPostIds, togglePostLike } from "@/services/likeService";
import { POSTS_QUERY_KEY } from "@/hooks/usePosts";
import {
  LIKES_QUERY_KEY,
  EXPLORE_QUERY_KEY,
  USER_POSTS_QUERY_KEY_PREFIX,
} from "@/lib/queryKeys";

export { LIKES_QUERY_KEY };

type LikesData = { likedPostIds: string[] };

const EMPTY_LIKES_DATA: LikesData = { likedPostIds: [] };

// apiFetch never throws on a failed request (see utils/apiClient.ts) —
// same reasoning as useSavedPosts.ts's mutationFailed.
function mutationFailed(result: { success: boolean } | undefined) {
  return result === undefined || !result.success;
}

// Same shape/spirit as useSavedPosts: "did I like this post" is kept as
// its own small fetch rather than joined onto every /api/posts response,
// so it works the same whether the Post objects came from the real feed,
// a profile grid, or (today) the still-mock single-post page. The
// optimistic-update / snapshot / rollback-or-refetch pattern is
// identical to useSavedPosts.ts too.
export function useLikedPosts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: LIKES_QUERY_KEY,
    queryFn: async (): Promise<LikesData> => {
      const result = await getLikedPostIds();
      if (!result?.success) return EMPTY_LIKES_DATA;
      return { likedPostIds: result.likedPostIds };
    },
  });

  const likedPostIds = useMemo(
    () => new Set(query.data?.likedPostIds ?? []),
    [query.data],
  );

  const toggleLikeMutation = useMutation({
    mutationFn: (postId: string) => togglePostLike(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: LIKES_QUERY_KEY });
      const previous = queryClient.getQueryData<LikesData>(LIKES_QUERY_KEY);
      queryClient.setQueryData<LikesData>(LIKES_QUERY_KEY, (old) => {
        const data = old ?? EMPTY_LIKES_DATA;
        const currentlyLiked = data.likedPostIds.includes(postId);
        return {
          likedPostIds: currentlyLiked
            ? data.likedPostIds.filter((id) => id !== postId)
            : [...data.likedPostIds, postId],
        };
      });
      return { previous };
    },
    onSettled: (result, _error, _postId, context) => {
      if (mutationFailed(result)) {
        if (context?.previous) {
          queryClient.setQueryData(LIKES_QUERY_KEY, context.previous);
        }
      } else {
        queryClient.invalidateQueries({ queryKey: LIKES_QUERY_KEY });
        // A like flips Post.likeCount too (derived via _count) — refetch
        // every cache that carries that same Post object, not just
        // Home's feed: Explore's ranked feed and the post author's own
        // profile grid (by prefix — this hook doesn't know whose post
        // it is without its own lookup) can both be showing the same
        // post with the old count otherwise.
        queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: EXPLORE_QUERY_KEY });
        queryClient.invalidateQueries({
          queryKey: USER_POSTS_QUERY_KEY_PREFIX,
        });
      }
    },
  });

  function isLiked(postId: string) {
    return likedPostIds.has(postId);
  }

  function toggleLike(postId: string) {
    toggleLikeMutation.mutate(postId);
  }

  return {
    isLiked,
    toggleLike,
    isLoading: query.isLoading,
  };
}
