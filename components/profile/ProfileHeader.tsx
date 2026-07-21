"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { XIcon } from "@phosphor-icons/react";
import { PATHS } from "@/utils/paths";

type BaseProps = {
  username: string;
  avatarSrc: string;
  bio?: string;
  toneTag?: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
};

// Own profile shows Edit Profile and links its stats to your own
// followers/following lists (/profile/followers, /profile/following).
// Someone else's profile shows a Follow toggle instead, and its stats
// link to their own per-user lists (/u/[username]/followers, etc.) —
// two different route families, since "your" lists and "their" lists
// aren't the same data.
type Props =
  | (BaseProps & { isOwnProfile: true })
  | (BaseProps & {
      isOwnProfile: false;
      isFollowing: boolean;
      followsMe: boolean;
      onToggleFollow: () => void;
    });

export function ProfileHeader(props: Props) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const {
    username,
    avatarSrc,
    bio,
    toneTag,
    postCount,
    followerCount,
    followingCount,
    isOwnProfile,
  } = props;

  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => setAvatarOpen(true)}
          aria-label={`View ${username}'s profile photo`}
          className="shrink-0 transition-transform active:scale-95"
        >
          <Image
            src={avatarSrc}
            alt={username}
            width={80}
            height={80}
            className="size-20 rounded-full object-cover"
          />
        </button>

        <div className="flex flex-1 justify-around text-center">
          <div className="flex flex-col">
            <span className="text-base font-semibold">{postCount}</span>
            <span className="text-xs text-foreground/50">Posts</span>
          </div>

          {isOwnProfile ? (
            <>
              <Link href={PATHS.FOLLOWERS} className="flex flex-col">
                <span className="text-base font-semibold">{followerCount}</span>
                <span className="text-xs text-foreground/50">Followers</span>
              </Link>
              <Link href={PATHS.FOLLOWING} className="flex flex-col">
                <span className="text-base font-semibold">
                  {followingCount}
                </span>
                <span className="text-xs text-foreground/50">Following</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href={PATHS.USER_FOLLOWERS(username)}
                className="flex flex-col"
              >
                <span className="text-base font-semibold">{followerCount}</span>
                <span className="text-xs text-foreground/50">Followers</span>
              </Link>
              <Link
                href={PATHS.USER_FOLLOWING(username)}
                className="flex flex-col"
              >
                <span className="text-base font-semibold">
                  {followingCount}
                </span>
                <span className="text-xs text-foreground/50">Following</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{username}</span>
          {toneTag && (
            <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] text-foreground/50">
              {toneTag}
            </span>
          )}
        </div>
        {bio && <p className="text-sm text-foreground/70">{bio}</p>}
      </div>

      {isOwnProfile ? (
        <Link
          href={PATHS.PROFILE_EDIT}
          className="w-full rounded-lg border border-foreground/15 py-2 text-center text-sm font-medium"
        >
          Edit profile
        </Link>
      ) : (
        <button
          type="button"
          onClick={props.onToggleFollow}
          className={`w-full rounded-lg py-2 text-sm font-medium ${
            props.isFollowing
              ? "border border-foreground/15 text-foreground"
              : "bg-foreground text-background"
          }`}
        >
          {props.isFollowing
            ? "Following"
            : props.followsMe
              ? "Follow back"
              : "Follow"}
        </button>
      )}

      {avatarOpen && (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-black/90"
          onClick={() => setAvatarOpen(false)}
        >
          <button
            type="button"
            onClick={() => setAvatarOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex size-9 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <XIcon size={20} />
          </button>

          <div
            className="relative aspect-square w-[min(80vw,22rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={avatarSrc}
              alt={username}
              fill
              unoptimized
              className="rounded-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
