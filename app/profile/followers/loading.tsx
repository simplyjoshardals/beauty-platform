import { UserListSkeleton } from "@/components/profile/UserListSkeleton";

// Route-level fallback for /profile/followers — same role as
// app/u/[username]/followers/loading.tsx (see its own comment), just
// for the "own followers" page instead of someone else's.
export default function FollowersLoading() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground/10 px-4 py-3">
        <p className="text-sm font-medium">Followers</p>
      </div>
      <UserListSkeleton />
    </div>
  );
}
