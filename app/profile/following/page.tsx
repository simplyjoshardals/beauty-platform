"use client";

import { useFollow } from "@/context/FollowProvider";
import { getMockUser } from "@/data/mockUsers";
import { UserListWithSearch } from "@/components/profile/UserListWithSearch";

export default function FollowingPage() {
  const { followingUsernames } = useFollow();
  const following = followingUsernames.map(getMockUser);

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
