"use client";

import Image from "next/image";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isMockFollowerOfCurrentUser } from "@/data/mockFollowers";
import { PATHS } from "@/utils/paths";
import { useAuthGatedAction } from "@/hooks/useAuthGatedAction";
import { AuthGateModal } from "@/components/auth/AuthGateModal";
import type { MockUser } from "@/data/mockUsers";

// Same real backend PostCard's follow button now uses (see
// hooks/useUserProfile.ts) — isFollowing/followsMe come off the Follow
// table, and toggleFollow optimistically patches this profile plus the
// two following/followers list caches it affects. NotificationRow is
// the one remaining consumer of context/FollowProvider's mock Set.
//
// One useUserProfile call per row means one request per row (React
// Query dedupes repeats of the same username, but a Followers/Following
// list is, by construction, all distinct usernames) — fine for the list
// sizes this app deals with, worth revisiting with a batched
// "isFollowing" field on the list endpoints themselves if that ever
// stops being true.
export function UserListRow({ user }: { user: MockUser }) {
  const { user: currentUser } = useCurrentUser();
  const { user: profile, toggleFollow } = useUserProfile(user.username);
  const { gateOpen, gateMessage, closeGate, guard } = useAuthGatedAction();
  const following = profile?.isFollowing ?? false;
  // Falls back to the mock pool only until this row's real profile
  // fetch resolves — profile.followsMe (once loaded) is the real Follow-
  // table fact; isMockFollowerOfCurrentUser was the only signal
  // available before this migration and stays as a placeholder default.
  const followsMe =
    profile?.followsMe ?? isMockFollowerOfCurrentUser(user.username);
  const isSelf = user.username === currentUser?.username;

  const label = following ? "Following" : followsMe ? "Follow back" : "Follow";

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Link
        href={PATHS.USER_PROFILE(user.username)}
        className="flex flex-1 items-center gap-3"
      >
        <Image
          src={user.avatarSrc}
          alt={user.username}
          width={44}
          height={44}
          className="size-11 shrink-0 rounded-full object-cover"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium">{user.username}</span>
          {user.toneTag && (
            <span className="text-xs text-foreground/50">{user.toneTag}</span>
          )}
        </div>
      </Link>

      {/* No self-follow row — this only shows for other people */}
      {!isSelf && (
        <button
          type="button"
          onClick={guard(toggleFollow)}
          className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            following
              ? "border border-foreground/15 text-foreground"
              : "bg-foreground text-background"
          }`}
        >
          {label}
        </button>
      )}

      <AuthGateModal
        open={gateOpen}
        onClose={closeGate}
        message={gateMessage}
      />
    </div>
  );
}
