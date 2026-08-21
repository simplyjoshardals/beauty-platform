"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, toggleFollowUser } from "@/services/userService";
import type { ProductTag } from "@/types/post";

export type PublicUserProfile = {
  id: string;
  username: string;
  avatarSrc: string;
  bio: string;
  toneTag: string;
  pinnedRoutine: ProductTag[];
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  followsMe: boolean;
};

function profileQueryKey(username: string) {
  return ["userProfile", username] as const;
}

// Backs /u/[username] — the one "view someone else's profile" page in
// the app. Real backend end to end: profile fields, follower/following
// counts, and the follow relationship itself all come from the Follow
// table now (see app/api/user/[username]/route.ts and its sibling
// follow/route.ts), unlike context/FollowProvider's local Set, which is
// still what every OTHER follow button in the app (PostCard,
// NotificationRow, UserListRow) reads and writes. Migrating those is a
// separate pass — until then, following someone from their profile page
// here won't be reflected on their post cards elsewhere in the feed.
export function useUserProfile(username: string) {
  const queryClient = useQueryClient();
  const queryKey = profileQueryKey(username);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await getUserProfile(username);
      if (!result?.success) return null;
      return result.user as PublicUserProfile;
    },
    enabled: Boolean(username),
  });

  // apiFetch never throws on a failed request (see utils/apiClient.ts) —
  // same optimistic-update / snapshot / rollback-or-refetch pattern as
  // useLikedPosts.toggleLike and useSavedPosts.
  const toggleFollowMutation = useMutation({
    mutationFn: () => toggleFollowUser(username),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PublicUserProfile | null>(
        queryKey,
      );
      queryClient.setQueryData<PublicUserProfile | null>(queryKey, (old) => {
        if (!old) return old;
        const nowFollowing = !old.isFollowing;
        return {
          ...old,
          isFollowing: nowFollowing,
          followerCount: old.followerCount + (nowFollowing ? 1 : -1),
        };
      });
      return { previous };
    },
    onSettled: (result, _error, _vars, context) => {
      if (result === undefined || !result.success) {
        if (context?.previous !== undefined) {
          queryClient.setQueryData(queryKey, context.previous);
        }
      } else {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  function toggleFollow() {
    toggleFollowMutation.mutate();
  }

  return {
    user: query.data ?? null,
    // True only while the request is in flight — once it resolves,
    // `user === null` means the fetch didn't succeed (not found, or a
    // network failure), same "no separate error state" simplicity
    // usePosts/useLikedPosts already use elsewhere in this app.
    isLoading: query.isLoading,
    toggleFollow,
  };
}
