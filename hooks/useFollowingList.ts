"use client";

import { useQuery } from "@tanstack/react-query";
import { getFollowing } from "@/services/userService";
import type { User } from "@/types/user";
import { followingQueryKey } from "@/lib/queryKeys";

// Same shape UserListWithSearch/UserListRow already render (MockUser),
// plus the real id the backend returns — kept for parity with other
// real-data hooks (useUserProfile's PublicUserProfile, useCurrentUser's
// CurrentUser) even though the list UI itself doesn't use it yet.
export type FollowingUser = User & {
  id: string;
  // The viewer's relationship to THIS row, computed batched server-side
  // (see lib/users.ts's getFollowingList / attachViewerRelationship) —
  // same fields GET /api/explore/users already returns via searchUsers.
  // UserListWithSearch passes these straight through to UserListRow as
  // initialFollowing/initialFollowsMe so the Follow/Following button is
  // correct on first paint, no per-row flash while that row's own
  // profile fetch resolves.
  isFollowing: boolean;
  followsMe: boolean;
  isSelf: boolean;
};

// Backs both Following pages — /profile/following (own) and
// /u/[username]/following (someone else's).
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
export { followingQueryKey };

// Search round-trips to the server — GET .../following?search=... (see
// lib/users.ts's getFollowingList) — instead of filtering an
// already-fetched full list client-side. `search` is part of the query
// key, so each distinct search string is its own cache entry;
// UserListWithSearch's server-search mode debounces keystrokes before
// this hook ever re-fires, and the "" entry (no search) is what the SSR
// prefetch on both Following pages warms ahead of the first client
// render.
export function useFollowingList(
  username: string | undefined,
  search: string = "",
) {
  const query = useQuery({
    queryKey: followingQueryKey(username, search),
    queryFn: async () => {
      const result = await getFollowing(
        username as string,
        search || undefined,
      );
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
