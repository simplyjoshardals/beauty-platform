"use client";

import Image from "next/image";
import Link from "next/link";
import { useFollow } from "@/context/FollowProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isMockFollowerOfCurrentUser } from "@/data/mockFollowers";
import { PATHS } from "@/utils/paths";
import { useAuthGatedAction } from "@/hooks/useAuthGatedAction";
import { AuthGateModal } from "@/components/auth/AuthGateModal";
import type { MockUser } from "@/data/mockUsers";

// Self-contained gate rather than a prop threaded down from every parent —
// this row renders on both fully-gated pages (own Followers/Following,
// Explore search) AND genuinely public ones (/u/[username]/followers,
// /u/[username]/following), so it can't assume auth was already checked
// by whatever page happens to be rendering it.
export function UserListRow({ user }: { user: MockUser }) {
  const { isFollowing, toggleFollow } = useFollow();
  const { user: currentUser } = useCurrentUser();
  const { gateOpen, gateMessage, closeGate, guard } = useAuthGatedAction();
  const following = isFollowing(user.username);
  const followsMe = isMockFollowerOfCurrentUser(user.username);
  // Compared against your LIVE username — MOCK_USERS never actually
  // includes "you," but if your current handle ever happened to collide
  // with a listed username, this still correctly recognizes it's you.
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
          onClick={guard(() => toggleFollow(user.username))}
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
