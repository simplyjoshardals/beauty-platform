"use client";

import { use, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { useUserPosts } from "@/hooks/useUserPosts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PATHS } from "@/utils/paths";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileHeaderSkeleton } from "@/components/profile/ProfileHeaderSkeleton";
import { PostGrid } from "@/components/profile/PostGrid";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { ProductChips } from "@/components/feed/ProductChips";
import { useAuthGatedAction } from "@/hooks/useAuthGatedAction";
import { AuthGateModal } from "@/components/auth/AuthGateModal";

type Props = {
  params: Promise<{ username: string }>;
};

export default function UserProfilePage({ params }: Props) {
  const { username } = use(params);
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const {
    user,
    isLoading: profileLoading,
    toggleFollow,
  } = useUserProfile(username);
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

  // profileLoading reflects the real GET /api/user/[username] request,
  // not a simulated timeout — once it resolves, user === null means the
  // fetch didn't succeed (nonexistent username, or a network failure),
  // so there's no fabricated fallback profile rendered with a working
  // Follow button for nobody. This is the only thing the full-page
  // skeleton waits on now: postsLoading (GET /api/user/[username]/posts,
  // via useUserPosts) is a separate, independent request, so it no
  // longer holds up the header too — it just gates the grid further
  // down, whichever of the two finishes first.
  if (profileLoading) {
    return (
      <div className="flex flex-col">
        <ProfileHeaderSkeleton />
        <div className="border-t border-foreground/10">
          <PostGridSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    notFound();
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
        // rather than holding up the header render for a count.
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
