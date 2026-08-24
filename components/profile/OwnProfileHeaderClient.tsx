"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileHeaderSkeleton } from "@/components/profile/ProfileHeaderSkeleton";
import { ProductChips } from "@/components/feed/ProductChips";

// Rendered directly (no Suspense) by app/profile/page.tsx. currentUser
// is prefetched both globally (app/layout.tsx, for BottomNav etc.) and
// again here for this page's own request — fetchCurrentUserForSSR is
// wrapped in React's cache(), so that's one DB hit, not two. On a fresh
// page load this resolves to real data immediately; the loading branch
// below is a real (if rarely hit) fallback for client-side navigation
// into this route, e.g. right after signing in, before hydration
// settles.
export function OwnProfileHeaderClient() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return (
      <>
        <ProfileHeaderSkeleton />
        <div className="animate-pulse border-t border-foreground/10 px-4 py-4">
          <div className="mb-2 h-3.5 w-16 rounded bg-foreground/10" />
          <div className="flex gap-2">
            <div className="h-7 w-28 shrink-0 rounded-full bg-foreground/10" />
            <div className="h-7 w-24 shrink-0 rounded-full bg-foreground/10" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ProfileHeader
        isOwnProfile
        username={user.username}
        avatarSrc={user.avatarSrc}
        bio={user.bio}
        toneTag={user.toneTag}
        postCount={user.postCount}
        followerCount={user.followerCount}
        followingCount={user.followingCount}
      />

      {user.pinnedRoutine.length > 0 && (
        <div className="border-t border-foreground/10 px-4 py-4">
          <p className="mb-2 text-sm font-medium">Routine</p>
          <ProductChips products={user.pinnedRoutine} />
        </div>
      )}
    </>
  );
}
