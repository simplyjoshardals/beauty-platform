"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment } from "@/types/comment";
import {
  listComments,
  addComment as addCommentRequest,
  deleteComment as deleteCommentRequest,
  toggleCommentLike as toggleCommentLikeRequest,
} from "@/services/commentService";
import { POSTS_QUERY_KEY } from "@/hooks/usePosts";
import {
  EXPLORE_QUERY_KEY,
  USER_POSTS_QUERY_KEY_PREFIX,
} from "@/lib/queryKeys";

// Same three-cache fan-out useLikedPosts' toggleLike does for
// Post.likeCount — Post.commentCount is derived via _count too (see
// prisma/schema.prisma), so an add/delete here needs to invalidate the
// same siblings: Home's feed, Explore's ranked feed, and the post
// author's own profile grid (by prefix — this hook only has a postId,
// not the author's username).
function invalidatePostCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: EXPLORE_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: USER_POSTS_QUERY_KEY_PREFIX });
}

// apiFetch never throws on a failed request (see utils/apiClient.ts) —
// same reasoning as useSavedPosts.ts's mutationFailed.
function mutationFailed(result: { success: boolean } | undefined) {
  return result === undefined || !result.success;
}

function toggleLikeInList(list: Comment[], commentId: string): Comment[] {
  return list.map((c) => {
    if (c.id === commentId) {
      const nextLiked = !c.likedByMe;
      return {
        ...c,
        likedByMe: nextLiked,
        likeCount: c.likeCount + (nextLiked ? 1 : -1),
      };
    }
    if (c.replies) {
      return { ...c, replies: toggleLikeInList(c.replies, commentId) };
    }
    return c;
  });
}

type CurrentUserLite = { id: string; username: string; avatarSrc: string };

// Lazily loaded per post — `enabled` is meant to be wired to
// CommentSheet's `open` state (see PostCard), so opening the sheet is
// what actually triggers the fetch, matching the fake-timeout skeleton
// this replaces. `currentUser` is only needed for the optimistic insert
// in addComment — pass undefined/null to skip it (the real comment will
// still show up once the mutation settles and this refetches).
export function useComments(
  postId: string,
  options?: { enabled?: boolean; currentUser?: CurrentUserLite | null },
) {
  const queryClient = useQueryClient();
  const enabled = options?.enabled ?? true;
  const currentUser = options?.currentUser ?? null;
  const queryKey = ["comments", postId] as const;

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<Comment[]> => {
      const result = await listComments(postId);
      if (!result?.success) return [];
      return result.comments;
    },
    enabled,
  });

  const comments = query.data ?? [];

  async function snapshotAndCancel() {
    await queryClient.cancelQueries({ queryKey });
    return queryClient.getQueryData<Comment[]>(queryKey);
  }

  function rollback(previous: Comment[] | undefined) {
    if (previous) {
      queryClient.setQueryData(queryKey, previous);
    }
  }

  // Same optimistic-update / snapshot / rollback-or-refetch pattern as
  // useSavedPosts.ts and useLikedPosts.ts throughout.
  const addCommentMutation = useMutation({
    mutationFn: ({
      text,
      parentId,
      replyToUserId,
    }: {
      text: string;
      parentId?: string;
      replyToUserId?: string;
    }) => addCommentRequest(postId, text, parentId, replyToUserId),
    onMutate: async ({ text, parentId }) => {
      const previous = await snapshotAndCancel();
      if (currentUser) {
        const tempComment: Comment = {
          id: `temp-${crypto.randomUUID()}`,
          author: {
            id: currentUser.id,
            username: currentUser.username,
            avatarSrc: currentUser.avatarSrc,
          },
          text,
          likeCount: 0,
          likedByMe: false,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<Comment[]>(queryKey, (old) => {
          const list = old ?? [];
          if (!parentId) return [...list, tempComment];
          return list.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies ?? []), tempComment] }
              : c,
          );
        });
      }
      return { previous };
    },
    onSettled: (result, _error, _vars, context) => {
      if (mutationFailed(result)) {
        rollback(context?.previous);
      } else {
        // Swaps the temp-id placeholder for the real comment, and picks
        // up Post.commentCount (derived via _count) catching up too.
        queryClient.invalidateQueries({ queryKey });
        invalidatePostCaches(queryClient);
      }
    },
  });

  // Mirrors the delete logic that used to live entirely client-side in
  // PostCard.handleDeleteComment — predicts the same outcome
  // (placeholder vs. full removal) optimistically, then reconciles with
  // whatever the server actually did (see app/api/.../comments/[commentId]/route.ts,
  // which applies the identical rule).
  const deleteCommentMutation = useMutation({
    mutationFn: ({ commentId }: { commentId: string; topLevelId?: string }) =>
      deleteCommentRequest(postId, commentId),
    onMutate: async ({ commentId, topLevelId }) => {
      const previous = await snapshotAndCancel();
      queryClient.setQueryData<Comment[]>(queryKey, (old) => {
        const list = old ?? [];
        if (topLevelId) {
          return list.map((c) =>
            c.id === topLevelId
              ? {
                  ...c,
                  replies: (c.replies ?? []).filter((r) => r.id !== commentId),
                }
              : c,
          );
        }
        const target = list.find((c) => c.id === commentId);
        const hasReplies = (target?.replies?.length ?? 0) > 0;
        if (hasReplies) {
          return list.map((c) =>
            c.id === commentId ? { ...c, deleted: true, text: "" } : c,
          );
        }
        return list.filter((c) => c.id !== commentId);
      });
      return { previous };
    },
    onSettled: (result, _error, _vars, context) => {
      if (mutationFailed(result)) {
        rollback(context?.previous);
      } else {
        queryClient.invalidateQueries({ queryKey });
        invalidatePostCaches(queryClient);
      }
    },
  });

  const toggleCommentLikeMutation = useMutation({
    mutationFn: (commentId: string) =>
      toggleCommentLikeRequest(postId, commentId),
    onMutate: async (commentId) => {
      const previous = await snapshotAndCancel();
      queryClient.setQueryData<Comment[]>(queryKey, (old) =>
        toggleLikeInList(old ?? [], commentId),
      );
      return { previous };
    },
    onSettled: (result, _error, _commentId, context) => {
      if (mutationFailed(result)) {
        rollback(context?.previous);
      } else {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  function addComment(text: string, parentId?: string, replyToUserId?: string) {
    addCommentMutation.mutate({ text, parentId, replyToUserId });
  }

  function deleteComment(commentId: string, topLevelId?: string) {
    deleteCommentMutation.mutate({ commentId, topLevelId });
  }

  function toggleCommentLike(commentId: string) {
    toggleCommentLikeMutation.mutate(commentId);
  }

  return {
    comments,
    isLoading: query.isLoading,
    addComment,
    deleteComment,
    toggleCommentLike,
  };
}
