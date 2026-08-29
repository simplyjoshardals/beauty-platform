"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, toggleFollowUser } from "@/services/userService";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  followingQueryKey,
  type FollowingUser,
} from "@/hooks/useFollowingList";
import { followersQueryKey } from "@/hooks/useFollowersList";
import type { ProductTag } from "@/types/post";
import { profileQueryKey } from "@/lib/queryKeys";

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
  // Sourced from the same _count aggregate as follower/followingCount
  // (see lib/users.ts) — a real count off the Post table, not
  // posts.length from a separately-fetched, heavier posts-with-media
  // query. Lets ProfileHeader show the right number immediately.
  postCount: number;
};

export { profileQueryKey };

// Adds/removes one row from a cached following/followers list, keyed by
// username — used below to keep the Following/Followers pages in sync
// with a follow toggled from elsewhere (a post card, someone's profile
// header) without those list hooks needing to know anything happened.
function addOrRemoveRow(
  list: FollowingUser[] | undefined,
  adding: boolean,
  row: FollowingUser,
): FollowingUser[] | undefined {
  if (!list) return list;
  if (adding) {
    return list.some((u) => u.username === row.username)
      ? list
      : [row, ...list];
  }
  return list.filter((u) => u.username !== row.username);
}

// Backs /u/[username]'s ProfileHeader, PostCard's follow button,
// UserListRow, and NotificationRow — every place in the app that reads
// or writes the real Follow table (see app/api/user/[username]/route.ts
// and its sibling follow/route.ts).
export function useUserProfile(
  username: string,
  options?: { enabled?: boolean },
) {
  const queryClient = useQueryClient();
  const queryKey = profileQueryKey(username);
  // The logged-in viewer, not the profile being looked at — needed so a
  // follow/unfollow here can also patch the VIEWER's own following list
  // (adding/removing this profile) and this profile's followers list
  // (adding/removing the viewer), the two list caches this toggle
  // actually affects.
  const { user: viewer } = useCurrentUser();
  const enabled = (options?.enabled ?? true) && Boolean(username);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await getUserProfile(username);
      if (!result?.success) return null;
      return result.user as PublicUserProfile;
    },
    enabled,
  });

  // apiFetch never throws on a failed request (see utils/apiClient.ts) —
  // same optimistic-update / snapshot / rollback-or-refetch pattern as
  // useLikedPosts.toggleLike and useSavedPosts, just across three cache
  // entries instead of one: this profile, the viewer's own following
  // list, and this profile's followers list.
  const toggleFollowMutation = useMutation({
    mutationFn: () => toggleFollowUser(username),
    onMutate: async () => {
      const viewerFollowingKey = followingQueryKey(viewer?.username);
      const targetFollowersKey = followersQueryKey(username);

      await Promise.all([
        queryClient.cancelQueries({ queryKey }),
        viewer
          ? queryClient.cancelQueries({ queryKey: viewerFollowingKey })
          : Promise.resolve(),
        queryClient.cancelQueries({ queryKey: targetFollowersKey }),
      ]);

      const previousProfile =
        queryClient.getQueryData<PublicUserProfile | null>(queryKey);
      const previousFollowingList = viewer
        ? queryClient.getQueryData<FollowingUser[]>(viewerFollowingKey)
        : undefined;
      const previousFollowersList =
        queryClient.getQueryData<FollowingUser[]>(targetFollowersKey);

      // Direction comes from the profile snapshot — if it's not loaded
      // yet, there's nothing to derive "now following or not" from, so
      // skip every optimistic update below and just let onSettled
      // invalidate everything once the request actually resolves.
      if (previousProfile) {
        const nowFollowing = !previousProfile.isFollowing;

        queryClient.setQueryData<PublicUserProfile | null>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            isFollowing: nowFollowing,
            followerCount: old.followerCount + (nowFollowing ? 1 : -1),
          };
        });

        if (viewer) {
          queryClient.setQueryData<FollowingUser[] | undefined>(
            viewerFollowingKey,
            (list) =>
              addOrRemoveRow(list, nowFollowing, {
                id: previousProfile.id,
                username: previousProfile.username,
                avatarSrc: previousProfile.avatarSrc,
                toneTag: previousProfile.toneTag,
                // Row is the target, from the viewer's own following
                // list — the viewer now follows them (that's this
                // action), and whether the target follows back is
                // unchanged by it, so carry that over from the profile
                // snapshot rather than guessing.
                isFollowing: true,
                followsMe: previousProfile.followsMe,
                isSelf: false,
              }),
          );

          queryClient.setQueryData<FollowingUser[] | undefined>(
            targetFollowersKey,
            (list) =>
              addOrRemoveRow(list, nowFollowing, {
                id: viewer.id,
                username: viewer.username,
                avatarSrc: viewer.avatarSrc,
                toneTag: viewer.toneTag,
                // Row is the viewer's own entry in this list — this
                // cache entry is only ever populated while the current
                // viewer is the one looking at this followers page, so
                // it's a self-row. Same convention lib/users.ts's
                // attachViewerRelationship uses: isFollowing/followsMe
                // forced false, isSelf true.
                isFollowing: false,
                followsMe: false,
                isSelf: true,
              }),
          );
        }
      }

      return { previousProfile, previousFollowingList, previousFollowersList };
    },
    onSettled: (result, _error, _vars, context) => {
      const viewerFollowingKey = followingQueryKey(viewer?.username);
      const targetFollowersKey = followersQueryKey(username);

      if (result === undefined || !result.success) {
        if (context?.previousProfile !== undefined) {
          queryClient.setQueryData(queryKey, context.previousProfile);
        }
        if (viewer && context?.previousFollowingList !== undefined) {
          queryClient.setQueryData(
            viewerFollowingKey,
            context.previousFollowingList,
          );
        }
        if (context?.previousFollowersList !== undefined) {
          queryClient.setQueryData(
            targetFollowersKey,
            context.previousFollowersList,
          );
        }
        return;
      }

      queryClient.invalidateQueries({ queryKey });
      if (viewer) {
        queryClient.invalidateQueries({ queryKey: viewerFollowingKey });
      }
      queryClient.invalidateQueries({ queryKey: targetFollowersKey });
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
