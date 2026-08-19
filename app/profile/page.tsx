"use client";

import { usePosts } from "@/hooks/usePosts";
import { useFollow } from "@/context/FollowProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CURRENT_USER_PROFILE } from "@/data/currentUserProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileHeaderSkeleton } from "@/components/profile/ProfileHeaderSkeleton";
import { PostGrid } from "@/components/profile/PostGrid";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { ProductChips } from "@/components/feed/ProductChips";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function ProfilePage() {
  const { posts } = usePosts();
  const { followingCount } = useFollow();
  const { user, isLoading } = useCurrentUser();

  // isLoading reflects the real /api/user/me request now, not a
  // simulated timeout — RequireAuth (wrapping this whole page) already
  // blocks on the same query before rendering children, so by the time
  // this component's own isLoading is false, user is guaranteed non-null.
  const myPosts = user
    ? posts.filter((post) => post.author.id === user.id)
    : [];

  // Computed once, wrapped once — RequireAuth only needs to appear a
  // single time regardless of which branch below actually renders.
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
          postCount={myPosts.length}
          followerCount={CURRENT_USER_PROFILE.followerCount}
          followingCount={followingCount}
        />

        {user.pinnedRoutine.length > 0 && (
          <div className="border-t border-foreground/10 px-4 py-4">
            <p className="mb-2 text-sm font-medium">Routine</p>
            <ProductChips products={user.pinnedRoutine} />
          </div>
        )}

        <div className="border-t border-foreground/10">
          <PostGrid posts={myPosts} />
        </div>
      </div>
    );

  return <RequireAuth>{content}</RequireAuth>;
}
