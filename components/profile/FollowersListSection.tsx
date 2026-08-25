"use client";

import { useState } from "react";
import { useFollowersList } from "@/hooks/useFollowersList";
import { UserListWithSearch } from "./UserListWithSearch";

// Owns the (debounced, server-side) search string for a Followers list —
// split out from the page itself since the pages
// (app/u/[username]/followers/page.tsx, app/profile/followers/page.tsx)
// are now Server Components doing their own SSR prefetch, and Server
// Components can't hold state. useFollowersList's `search` param
// round-trips to GET /api/user/[username]/followers?search=..., so
// filtering happens in the DB query (lib/users.ts's getFollowersList),
// not by filtering an already-fetched list client-side.
export function FollowersListSection({
  username,
}: {
  username: string | undefined;
}) {
  const [search, setSearch] = useState("");
  const { users: followers, isLoading } = useFollowersList(username, search);

  return (
    <UserListWithSearch
      users={followers}
      emptyLabel="No followers yet."
      isLoading={isLoading}
      onSearchChange={setSearch}
    />
  );
}
