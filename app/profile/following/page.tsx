"use client";

import { useFollow } from "@/context/FollowProvider";
import { getMockUser, type MockUser } from "@/data/mockUsers";
import { UserListWithSearch } from "@/components/profile/UserListWithSearch";

export default function FollowingPage() {
  const { followingUsernames } = useFollow();
  // Guards against a username in followingUsernames that has no matching
  // entry in MOCK_USERS — shouldn't happen given how usernames get added
  // to that set today, but this keeps the list honest either way rather
  // than crashing or fabricating a placeholder row.
  const following = followingUsernames
    .map(getMockUser)
    .filter((u): u is MockUser => u !== undefined);

  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground/10 px-4 py-3">
        <p className="text-sm font-medium">Following</p>
      </div>

      <UserListWithSearch
        users={following}
        emptyLabel="Not following anyone yet."
      />
    </div>
  );
}
