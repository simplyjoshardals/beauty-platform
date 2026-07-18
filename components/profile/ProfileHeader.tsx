import Image from "next/image";
import Link from "next/link";

type Props = {
  username: string;
  avatarSrc: string;
  bio: string;
  toneTag?: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
};

export function ProfileHeader({
  username,
  avatarSrc,
  bio,
  toneTag,
  postCount,
  followerCount,
  followingCount,
}: Props) {
  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      <div className="flex items-center gap-5">
        <Image
          src={avatarSrc}
          alt={username}
          width={80}
          height={80}
          className="size-20 shrink-0 rounded-full object-cover"
        />

        <div className="flex flex-1 justify-around text-center">
          <div className="flex flex-col">
            <span className="text-base font-semibold">{postCount}</span>
            <span className="text-xs text-foreground/50">Posts</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold">{followerCount}</span>
            <span className="text-xs text-foreground/50">Followers</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold">{followingCount}</span>
            <span className="text-xs text-foreground/50">Following</span>
          </div>
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
        <p className="text-sm text-foreground/70">{bio}</p>
      </div>

      <Link
        href="/profile/edit"
        className="w-full rounded-lg border border-foreground/15 py-2 text-center text-sm font-medium"
      >
        Edit profile
      </Link>
    </div>
  );
}
