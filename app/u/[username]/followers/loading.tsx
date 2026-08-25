import { UserListSkeleton } from "@/components/profile/UserListSkeleton";

// Route-level fallback for /u/[username]/followers, same role
// app/(home)/loading.tsx, app/u/[username]/loading.tsx, and
// app/saved/loading.tsx play for their own routes — shown during the
// initial navigation Suspense boundary, before the Server Component in
// page.tsx has resolved (the profile lookup, and — for a logged-in
// viewer — the followers list + row-profile prefetch). Mirrors that
// page's own header markup so there's no layout shift when the real
// content swaps in.
export default function UserFollowersLoading() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground/10 px-4 py-3">
        <p className="text-sm font-medium">Followers</p>
      </div>
      <UserListSkeleton />
    </div>
  );
}
