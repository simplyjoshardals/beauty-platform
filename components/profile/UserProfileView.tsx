"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserPosts } from "@/hooks/useUserPosts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PATHS } from "@/utils/paths";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostGrid } from "@/components/profile/PostGrid";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { ProductChips } from "@/components/feed/ProductChips";
import { useAuthGatedAction } from "@/hooks/useAuthGatedAction";
import { AuthGateModal } from "@/components/auth/AuthGateModal";

type Props = {
  username: string;
};

// Rendering logic for /u/[username], unchanged from what used to live
// directly in app/u/[username]/page.tsx — the only thing that moved is
// *where* it runs. app/u/[username]/page.tsx is now an async Server
// Component that prefetches this profile (profileQueryKey) and their
// posts (USER_POSTS_QUERY_KEY) and 404s server-side if the user doesn't
// exist, so useUserProfile()/useUserPosts() below read already-hydrated
// cache on first render — no more skeleton flash before the header
// appears, and the post count is correct immediately instead of
// starting at 0 while postsLoading catches up.
export function UserProfileView({ username }: Props) {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const { user, toggleFollow } = useUserProfile(username);
  const { posts: userPosts, isLoading: postsLoading } = useUserPosts(username);
  const { gateOpen, closeGate, guard } = useAuthGatedAction();

  // This route is for viewing OTHER people. Your own profile — with Edit
  // Profile instead of a Follow button — lives at /profile. Redirect
  // rather than rendering a nonsensical "follow yourself" state.
  // Compared against your LIVE username (not a frozen constant) — since
  // username is now editable, visiting /u/your-new-handle needs to still
  // correctly recognize it's you, right after a rename.
  const isSelf = username === currentUser?.username;

  useEffect(() => {
    if (isSelf) {
      router.replace(PATHS.PROFILE);
    }
  }, [isSelf, router]);

  if (isSelf) {
    return null;
  }

  // The nonexistent-username case is now handled server-side in
  // app/u/[username]/page.tsx (a real notFound() before this component
  // ever renders), so `user` here is only ever null for the brief
  // instant before hydration settles on a client-side navigation into
  // this route — same profileLoading skeleton as before, just rarely hit
  // on a fresh page load now that it's SSR-prefetched.
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <ProfileHeader
        isOwnProfile={false}
        username={user.username}
        avatarSrc={user.avatarSrc}
        bio={user.bio}
        toneTag={user.toneTag}
        // Falls back to 0 while the posts request is still in flight
        // rather than holding up the header render for a count. With
        // SSR prefetch in place, postsLoading is already false on
        // first paint, so this resolves to the real count immediately.
        postCount={postsLoading ? 0 : userPosts.length}
        followerCount={user.followerCount}
        followingCount={user.followingCount}
        isFollowing={user.isFollowing}
        followsMe={user.followsMe}
        onToggleFollow={guard(toggleFollow)}
      />

      {user.pinnedRoutine.length > 0 && (
        <div className="border-t border-foreground/10 px-4 py-4">
          <p className="mb-2 text-sm font-medium">Routine</p>
          <ProductChips products={user.pinnedRoutine} />
        </div>
      )}

      <div className="border-t border-foreground/10">
        {postsLoading ? <PostGridSkeleton /> : <PostGrid posts={userPosts} />}
      </div>

      <AuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
}
