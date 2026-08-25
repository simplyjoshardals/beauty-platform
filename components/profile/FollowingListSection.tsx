"use client";

import { useState } from "react";
import { useFollowingList } from "@/hooks/useFollowingList";
import { UserListWithSearch } from "./UserListWithSearch";

// Mirrors FollowersListSection exactly, just the reverse Follow
// direction. Owns the (debounced, server-side) search string for a
// Following list — split out from the page itself since the pages
// (app/u/[username]/following/page.tsx, app/profile/following/page.tsx)
// are now Server Components doing their own SSR prefetch, and Server
// Components can't hold state. useFollowingList's `search` param
// round-trips to GET /api/user/[username]/following?search=..., so
// filtering happens in the DB query (lib/users.ts's getFollowingList),
// not by filtering an already-fetched list client-side.
export function FollowingListSection({
  username,
}: {
  username: string | undefined;
}) {
  const [search, setSearch] = useState("");
  const { users: following, isLoading } = useFollowingList(username, search);

  return (
    <UserListWithSearch
      users={following}
      emptyLabel="Not following anyone yet."
      isLoading={isLoading}
      onSearchChange={setSearch}
    />
  );
}
