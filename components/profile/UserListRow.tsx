"use client";

import Image from "next/image";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PATHS } from "@/utils/paths";
import { followLabel } from "@/utils/followLabel";
import { useAuthGatedAction } from "@/hooks/useAuthGatedAction";
import { AuthGateModal } from "@/components/auth/AuthGateModal";
import type { User } from "@/types/user";

// Same real backend PostCard's follow button now uses (see
// hooks/useUserProfile.ts) — isFollowing/followsMe come off the Follow
// table, and toggleFollow optimistically patches this profile plus the
// two following/followers list caches it affects.
//
// One useUserProfile call per row means one request per row (React
// Query dedupes repeats of the same username, but a Followers/Following
// list is, by construction, all distinct usernames) — fine for the list
// sizes this app deals with. Explore's search now sidesteps the
// resulting flash-of-"Follow" by passing initialFollowing/initialFollowsMe
// (computed batched, server-side — see lib/users.ts's searchUsers)
// straight through; Followers/Following don't have that batched field
// yet, so their rows briefly default to "Follow"/false until their own
// useUserProfile call resolves.
type Props = {
  user: User;
  // Known up front from whatever list produced this row (e.g. Explore's
  // search, which now computes isFollowing/followsMe server-side — see
  // lib/users.ts's searchUsers) so the row can render the correct label
  // on first paint instead of defaulting to "Follow" for a beat while
  // this row's own useUserProfile fetch resolves. Once that fetch
  // resolves it takes over as the source of truth either way.
  initialFollowing?: boolean;
  initialFollowsMe?: boolean;
};

export function UserListRow({
  user,
  initialFollowing,
  initialFollowsMe,
}: Props) {
  const { user: currentUser } = useCurrentUser();
  const { user: profile, toggleFollow } = useUserProfile(user.username);
  const { gateOpen, gateMessage, closeGate, guard } = useAuthGatedAction();
  const following = profile?.isFollowing ?? initialFollowing ?? false;
  // Falls back to initialFollowsMe (when the caller has it), otherwise
  // false, only until this row's real profile fetch resolves —
  // profile.followsMe (once loaded) is the real Follow-table fact, and
  // this is a genuine "don't know yet" default rather than a guess, now
  // that the mock followers pool is gone.
  const followsMe = profile?.followsMe ?? initialFollowsMe ?? false;
  const isSelf = user.username === currentUser?.username;

  const label = followLabel(following, followsMe);

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
