"use client";

import Image from "next/image";
import Link from "next/link";
import { useFollow } from "@/context/FollowProvider";
import { CURRENT_USER } from "@/constants/currentUser";
import { PATHS } from "@/utils/paths";
import type { MockUser } from "@/data/mockUsers";

export function UserListRow({ user }: { user: MockUser }) {
  const { isFollowing, toggleFollow } = useFollow();
  const following = isFollowing(user.username);
  const isSelf = user.username === CURRENT_USER.username;

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
          onClick={() => toggleFollow(user.username)}
          className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            following
              ? "border border-foreground/15 text-foreground"
              : "bg-foreground text-background"
          }`}
        >
          {following ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
}
