"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProductChips } from "@/components/feed/ProductChips";
import { useAuthGatedAction } from "@/hooks/useAuthGatedAction";
import { AuthGateModal } from "@/components/auth/AuthGateModal";

type Props = {
  username: string;
};

// Rendered directly (no Suspense) by app/u/[username]/page.tsx — the
// profile query is already prefetched/hydrated by the time this mounts,
// since that page awaits it before rendering anything, so `user` is
// non-null on first paint. The null check below only matters for a
// client-side navigation into this route before hydration settles.
export function ProfileHeaderClient({ username }: Props) {
  const { user, toggleFollow } = useUserProfile(username);
  const { gateOpen, closeGate, guard } = useAuthGatedAction();

  if (!user) {
    return null;
  }

  return (
    <>
      <ProfileHeader
        isOwnProfile={false}
        username={user.username}
        avatarSrc={user.avatarSrc}
        bio={user.bio}
        toneTag={user.toneTag}
        postCount={user.postCount}
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

      <AuthGateModal open={gateOpen} onClose={closeGate} />
    </>
  );
}
