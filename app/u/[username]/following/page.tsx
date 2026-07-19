import { notFound } from "next/navigation";
import { getMockUser } from "@/data/mockUsers";
import { getMockConnectionsFor } from "@/data/mockFollowers";
import { UserListWithSearch } from "@/components/profile/UserListWithSearch";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserFollowingPage({ params }: Props) {
  const { username } = await params;

  if (!getMockUser(username)) {
    notFound();
  }

  const following = getMockConnectionsFor(username);

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
