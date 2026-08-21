"use client";

import { useQuery } from "@tanstack/react-query";
import { getFollowing } from "@/services/userService";
import type { MockUser } from "@/data/mockUsers";

// Same shape UserListWithSearch/UserListRow already render (MockUser),
// plus the real id the backend returns — kept for parity with other
// real-data hooks (useUserProfile's PublicUserProfile, useCurrentUser's
// CurrentUser) even though the list UI itself doesn't use it yet.
export type FollowingUser = MockUser & { id: string };

// Backs both Following pages — /profile/following (own) and
// /u/[username]/following (someone else's). A single fetch of the full
// list; search stays client-side in UserListWithSearch for now (see its
// own comment), even though the underlying API already accepts
// ?search= for when that needs to move server-side.
//
// Pass undefined to hold the query off entirely — used by
// /u/[username]/following so the request isn't fired until the viewer's
// auth state is actually known (the endpoint requires a session; there's
// no reason to attempt it, and risk apiFetch's 401 handling kicking in,
// for a visitor who isn't signed in at all).
// Exported so useUserProfile can reach into this exact cache entry when
// a follow/unfollow happens elsewhere (PostCard, ProfileHeader) — that's
// what lets toggling follow from a post card optimistically update this
// list without this hook needing to know anything about who's doing it.
export function followingQueryKey(username: string | undefined) {
  return ["following", username] as const;
}

export function useFollowingList(username: string | undefined) {
  const query = useQuery({
    queryKey: followingQueryKey(username),
    queryFn: async () => {
      const result = await getFollowing(username as string);
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
