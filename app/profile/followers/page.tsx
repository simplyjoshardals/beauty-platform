"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useFollowersList } from "@/hooks/useFollowersList";
import { UserListWithSearch } from "@/components/profile/UserListWithSearch";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function FollowersPage() {
  const { user: currentUser } = useCurrentUser();
  // undefined until useCurrentUser resolves — same pattern
  // /profile/following uses, so this never fires as a request for a
  // username that doesn't exist yet.
  const { users: followers, isLoading } = useFollowersList(
    currentUser?.username,
  );

  return (
    <RequireAuth>
      <div className="flex flex-col">
        <div className="border-b border-foreground/10 px-4 py-3">
          <p className="text-sm font-medium">Followers</p>
        </div>

        <UserListWithSearch
          users={followers}
          emptyLabel="No followers yet."
          isLoading={isLoading}
        />
      </div>
    </RequireAuth>
  );
}
