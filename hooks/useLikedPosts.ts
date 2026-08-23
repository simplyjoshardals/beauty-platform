"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLikedPostIds, togglePostLike } from "@/services/likeService";
import { POSTS_QUERY_KEY } from "@/hooks/usePosts";
import { LIKES_QUERY_KEY } from "@/lib/queryKeys";

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
        // the feed so that number catches up with what just happened
        // here, same as how a comment add/delete needs to below.
        queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
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
