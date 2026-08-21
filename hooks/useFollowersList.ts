"use client";

import { useQuery } from "@tanstack/react-query";
import { getFollowers } from "@/services/userService";
import type { FollowingUser } from "./useFollowingList";

// Mirrors useFollowingList exactly, just the reverse Follow direction.
// Reuses its FollowingUser type — same shape (MockUser + real id) since
// both the following and followers rows render through the same
// UserListRow/UserListWithSearch.

// Exported for the same reason followingQueryKey is — lets useUserProfile
// optimistically add/remove a row from a target user's followers list
// when the viewer follows/unfollows them, without this hook needing to
// know anything about who triggered it.
export function followersQueryKey(username: string | undefined) {
  return ["followers", username] as const;
}

export function useFollowersList(username: string | undefined) {
  const query = useQuery({
    queryKey: followersQueryKey(username),
    queryFn: async () => {
      const result = await getFollowers(username as string);
      if (!result?.success) return [];
      return result.users as FollowingUser[];
    },
    enabled: Boolean(username),
  });

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
  };
}
