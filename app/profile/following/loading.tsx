import { UserListSkeleton } from "@/components/profile/UserListSkeleton";

// Route-level fallback for /profile/following — same role as
// app/profile/followers/loading.tsx (see its own comment), just for the
// "own following" page instead of someone else's.
export default function FollowingLoading() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground/10 px-4 py-3">
        <p className="text-sm font-medium">Following</p>
      </div>
      <UserListSkeleton />
    </div>
  );
}
