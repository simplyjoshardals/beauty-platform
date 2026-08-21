"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useFollowingList } from "@/hooks/useFollowingList";
import { UserListWithSearch } from "@/components/profile/UserListWithSearch";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function FollowingPage() {
  const { user: currentUser } = useCurrentUser();
  // undefined until useCurrentUser resolves — same `enabled` pattern
  // useUserPosts uses for "own profile before auth is known" — so this
  // never fires as a request for a username that doesn't exist yet.
  const { users: following, isLoading } = useFollowingList(
    currentUser?.username,
  );

  return (
    <RequireAuth>
      <div className="flex flex-col">
        <div className="border-b border-foreground/10 px-4 py-3">
          <p className="text-sm font-medium">Following</p>
        </div>

        <UserListWithSearch
          users={following}
          emptyLabel="Not following anyone yet."
          isLoading={isLoading}
        />
      </div>
    </RequireAuth>
  );
}
