"use client";

import { useUserPosts } from "@/hooks/useUserPosts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileHeaderSkeleton } from "@/components/profile/ProfileHeaderSkeleton";
import { PostGrid } from "@/components/profile/PostGrid";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { ProductChips } from "@/components/feed/ProductChips";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function ProfilePage() {
  const { user, isLoading } = useCurrentUser();
  // Fetched directly for just this user (GET /api/user/[username]/posts)
  // rather than pulled out of the whole feed via usePosts() and filtered
  // client-side — same per-user endpoint /u/[username] uses (see
  // hooks/useUserPosts.ts). Undefined username while user is still
  // loading just holds the query off via `enabled`.
  const { posts: myPosts, isLoading: postsLoading } = useUserPosts(
    user?.username,
  );

  const content =
    isLoading || !user ? (
      <div className="flex flex-col">
        <ProfileHeaderSkeleton />
        <div className="animate-pulse border-t border-foreground/10 px-4 py-4">
          <div className="mb-2 h-3.5 w-16 rounded bg-foreground/10" />
          <div className="flex gap-2">
            <div className="h-7 w-28 shrink-0 rounded-full bg-foreground/10" />
            <div className="h-7 w-24 shrink-0 rounded-full bg-foreground/10" />
          </div>
        </div>
        <div className="border-t border-foreground/10">
          <PostGridSkeleton />
        </div>
      </div>
    ) : (
      <div className="flex flex-col">
        <ProfileHeader
          isOwnProfile
          username={user.username}
          avatarSrc={user.avatarSrc}
          bio={user.bio}
          toneTag={user.toneTag}
          // Falls back to 0 while posts are still loading rather than
          // holding up the whole header for a count — matches the grid
          // below, which shows its own skeleton in the meantime.
          postCount={postsLoading ? 0 : myPosts.length}
          followerCount={user.followerCount}
          followingCount={user.followingCount}
        />

        {user.pinnedRoutine.length > 0 && (
          <div className="border-t border-foreground/10 px-4 py-4">
            <p className="mb-2 text-sm font-medium">Routine</p>
            <ProductChips products={user.pinnedRoutine} />
          </div>
        )}

        <div className="border-t border-foreground/10">
          {postsLoading ? <PostGridSkeleton /> : <PostGrid posts={myPosts} />}
        </div>
      </div>
    );

  return <RequireAuth>{content}</RequireAuth>;
}
