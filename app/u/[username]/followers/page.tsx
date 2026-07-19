import { notFound } from "next/navigation";
import { getMockUser } from "@/data/mockUsers";
import { getMockConnectionsFor } from "@/data/mockFollowers";
import { UserListWithSearch } from "@/components/profile/UserListWithSearch";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserFollowersPage({ params }: Props) {
  const { username } = await params;

  // Same check as the profile page itself — no followers list for
  // somebody who doesn't exist.
  if (!getMockUser(username)) {
    notFound();
  }

  const followers = getMockConnectionsFor(username);

  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground/10 px-4 py-3">
        <p className="text-sm font-medium">Followers</p>
      </div>

      <UserListWithSearch users={followers} emptyLabel="No followers yet." />
    </div>
  );
}
