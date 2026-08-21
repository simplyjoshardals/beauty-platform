"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useFollowersList } from "@/hooks/useFollowersList";
import { UserListWithSearch } from "@/components/profile/UserListWithSearch";
import { RequireAuth } from "@/components/auth/RequireAuth";

type Props = {
  params: Promise<{ username: string }>;
};

export default function UserFollowersPage({ params }: Props) {
  const { username } = use(params);
  const { isAuthenticated } = useCurrentUser();

  // GET /api/user/[username] is public (same as the /u/[username]
  // profile page itself) — used here only to 404 on a nonexistent
  // username, same check the mock version had.
  const { user, isLoading: profileLoading } = useUserProfile(username);

  // Held off until the viewer is confirmed authenticated — mirrors
  // /u/[username]/following exactly: the backend requires a session
  // regardless, but there's no reason to fire the request for a visitor
  // who isn't signed in.
  const { users: followers, isLoading: followersLoading } = useFollowersList(
    isAuthenticated ? username : undefined,
  );

  if (!profileLoading && !user) {
    notFound();
  }

  // Same posture as /u/[username]/following: the profile stays public,
  // only this list (and its API route) require a session.
  return (
    <RequireAuth>
      <div className="flex flex-col">
        <div className="border-b border-foreground/10 px-4 py-3">
          <p className="text-sm font-medium">Followers</p>
        </div>

        <UserListWithSearch
          users={followers}
          emptyLabel="No followers yet."
          isLoading={followersLoading}
        />
      </div>
    </RequireAuth>
  );
}
