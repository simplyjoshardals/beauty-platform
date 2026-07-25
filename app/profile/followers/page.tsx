import { mockFollowerUsernames } from "@/data/mockFollowers";
import { getMockUser, type MockUser } from "@/data/mockUsers";
import { UserListWithSearch } from "@/components/profile/UserListWithSearch";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function FollowersPage() {
  // mockFollowerUsernames is derived directly from MOCK_USERS, so every
  // lookup here is guaranteed to resolve — the filter is defensive, not
  // expected to ever actually drop anything.
  const followers = mockFollowerUsernames
    .map(getMockUser)
    .filter((u): u is MockUser => u !== undefined);

  return (
    <RequireAuth>
      <div className="flex flex-col">
        <div className="border-b border-foreground/10 px-4 py-3">
          <p className="text-sm font-medium">Followers</p>
        </div>

        <UserListWithSearch users={followers} emptyLabel="No followers yet." />
      </div>
    </RequireAuth>
  );
}
