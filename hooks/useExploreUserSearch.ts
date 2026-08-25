"use client";

import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/services/userService";
import { exploreUserSearchQueryKey } from "@/lib/queryKeys";
import type { FollowingUser } from "./useFollowingList";

// Same shape as the follow-list rows, plus the follow-state fields the
// search endpoint now computes server-side (see lib/users.ts's
// searchUsers) — so UserListRow can render the right Follow/Following
// label immediately instead of defaulting to "Follow" until a separate
// per-row profile fetch resolves.
export type ExploreSearchUser = FollowingUser & {
  isFollowing: boolean;
  followsMe: boolean;
  isSelf: boolean;
};

// Backs Explore's "search people" box (components/explore/ExploreFeed.tsx).
// Mirrors useFollowersList/useFollowingList's server-search shape: the
// caller debounces keystrokes (see ExploreFeed, same pattern as
// UserListWithSearch) and hands the settled query straight to this hook,
// which round-trips it to GET /api/explore/users?search=... — no
// client-side filtering of a pre-fetched list.
//
// Unlike Followers/Following, an empty query is never fetched (`enabled`
// requires a non-blank search) — there's no "everyone" list to show by
// default here, so the query simply doesn't run until the visitor has
// typed something.
export function useExploreUserSearch(search: string) {
  const trimmed = search.trim();

  const query = useQuery({
    queryKey: exploreUserSearchQueryKey(trimmed),
    queryFn: async () => {
      const result = await searchUsers(trimmed);
      if (!result?.success) return [];
      return result.users as ExploreSearchUser[];
    },
    enabled: trimmed.length > 0,
  });

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
  };
}
