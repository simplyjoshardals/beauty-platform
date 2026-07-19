import { mockFollowerUsernames } from "@/data/mockFollowers";
import { getMockUser } from "@/data/mockUsers";
import { UserListWithSearch } from "@/components/profile/UserListWithSearch";

export default function FollowersPage() {
  const followers = mockFollowerUsernames.map(getMockUser);

  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground/10 px-4 py-3">
        <p className="text-sm font-medium">Followers</p>
      </div>

      <UserListWithSearch users={followers} emptyLabel="No followers yet." />
    </div>
  );
}
