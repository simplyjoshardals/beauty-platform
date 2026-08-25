"use client";

import { useQuery } from "@tanstack/react-query";
import { getFollowers } from "@/services/userService";
import { followersQueryKey } from "@/lib/queryKeys";
import type { FollowingUser } from "./useFollowingList";

// Mirrors useFollowingList exactly, just the reverse Follow direction.
// Reuses its FollowingUser type — same shape (MockUser + real id) since
// both the following and followers rows render through the same
// UserListRow/UserListWithSearch.

// The real key now lives in lib/queryKeys.ts (not here) — same reasoning
// as followingQueryKey: a Server Component (app/u/[username]/followers/
// page.tsx, app/profile/followers/page.tsx) needs the real function to
// construct a matching key for its SSR prefetch, not a "use client"
// stub. Re-exported from here so useUserProfile's existing import keeps
// working unchanged.
export { followersQueryKey };

// Search now round-trips to the server — GET .../followers?search=...
// (see lib/users.ts's getFollowersList) — instead of filtering an
// already-fetched full list client-side, the way Following still does.
// `search` is part of the query key, so each distinct search string is
// its own cache entry; UserListWithSearch's server-search mode debounces
// keystrokes before this hook ever re-fires, and the "" entry (no
// search) is what the SSR prefetch on both Followers pages warms ahead
// of the first client render.
export function useFollowersList(
  username: string | undefined,
  search: string = "",
) {
  const query = useQuery({
    queryKey: followersQueryKey(username, search),
    queryFn: async () => {
      const result = await getFollowers(
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
