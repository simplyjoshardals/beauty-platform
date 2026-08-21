"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useFollowingList } from "@/hooks/useFollowingList";
import { UserListWithSearch } from "@/components/profile/UserListWithSearch";
import { RequireAuth } from "@/components/auth/RequireAuth";

type Props = {
  params: Promise<{ username: string }>;
};

export default function UserFollowingPage({ params }: Props) {
  const { username } = use(params);
  const { isAuthenticated } = useCurrentUser();

  // GET /api/user/[username] is public (same as the /u/[username]
  // profile page itself) — used here only to 404 on a nonexistent
  // username, same check the mock version had.
  const { user, isLoading: profileLoading } = useUserProfile(username);

  // Held off until the viewer is confirmed authenticated — the backend
  // requires a session regardless (see the route handler), but there's
  // no reason to fire the request, and risk apiFetch's 401 → hard
  // redirect, for a visitor who isn't signed in.
  const { users: following, isLoading: followingLoading } = useFollowingList(
    isAuthenticated ? username : undefined,
  );

  if (!profileLoading && !user) {
    notFound();
  }

  // RequireAuth gates the Following list itself, not the profile it
  // belongs to — the actual /u/[username] profile stays public; only
  // this page (and its API route) require a session. Non-dismissible,
  // same as every other RequireAuth usage: there's nothing to browse
  // read-only behind it here, since this page is only the list.
  return (
    <RequireAuth>
      <div className="flex flex-col">
        <div className="border-b border-foreground/10 px-4 py-3">
          <p className="text-sm font-medium">Following</p>
        </div>

        <UserListWithSearch
          users={following}
          emptyLabel="Not following anyone yet."
          isLoading={followingLoading}
        />
      </div>
    </RequireAuth>
  );
}
