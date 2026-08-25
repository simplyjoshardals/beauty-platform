import { UserListSkeleton } from "@/components/profile/UserListSkeleton";
import { SearchBarSkeleton } from "@/components/profile/SearchBarSkeleton";

// Route-level fallback for /profile/following — same role as
// app/profile/followers/loading.tsx (see its own comment), just for the
// "own following" page instead of someone else's. Includes the search
// bar shell (see SearchBarSkeleton) since FollowingListSection renders
// one via UserListWithSearch — without it here, that bar would pop in
// only once the real content mounts.
export default function FollowingLoading() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground/10 px-4 py-3">
        <p className="text-sm font-medium">Following</p>
      </div>
      <SearchBarSkeleton />
      <UserListSkeleton />
    </div>
  );
}
