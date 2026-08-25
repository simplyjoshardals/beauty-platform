import { UserListSkeleton } from "@/components/profile/UserListSkeleton";

// Route-level fallback for /u/[username]/following — same role as
// app/u/[username]/followers/loading.tsx (see its own comment), just
// for the reverse Follow direction.
export default function UserFollowingLoading() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground/10 px-4 py-3">
        <p className="text-sm font-medium">Following</p>
      </div>
      <UserListSkeleton />
    </div>
  );
}
