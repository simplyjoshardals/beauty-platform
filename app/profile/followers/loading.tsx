import { UserListSkeleton } from "@/components/profile/UserListSkeleton";
import { SearchBarSkeleton } from "@/components/profile/SearchBarSkeleton";

// Route-level fallback for /profile/followers — same role as
// app/u/[username]/followers/loading.tsx (see its own comment), just
// for the "own followers" page instead of someone else's. Includes the
// search bar shell (see SearchBarSkeleton) since FollowersListSection
// renders one via UserListWithSearch — without it here, that bar would
// pop in only once the real content mounts.
export default function FollowersLoading() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground/10 px-4 py-3">
        <p className="text-sm font-medium">Followers</p>
      </div>
      <SearchBarSkeleton />
      <UserListSkeleton />
    </div>
  );
}
