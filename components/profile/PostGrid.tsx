import Image from "next/image";
import Link from "next/link";
import {
  VideoCameraIcon,
  StackIcon,
  ArrowsLeftRightIcon,
} from "@phosphor-icons/react";
import type { Post } from "@/types/post";
import { getPostThumbnail } from "@/utils/postThumbnail";

function MediaTypeBadge({ type }: { type: Post["media"]["type"] }) {
  if (type === "video") {
    return (
      <VideoCameraIcon
        size={14}
        weight="fill"
        className="text-white drop-shadow"
      />
    );
  }
  if (type === "carousel") {
    return (
      <StackIcon size={14} weight="fill" className="text-white drop-shadow" />
    );
  }
  if (type === "before_after") {
    return (
      <ArrowsLeftRightIcon
        size={14}
        weight="fill"
        className="text-white drop-shadow"
      />
    );
  }
  return null;
}

export function PostGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 px-6 py-16 text-center">
        <p className="text-sm font-medium">No posts yet</p>
        <p className="text-sm text-foreground/50">
          Posts you share will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map((post) => {
        const thumbnail = getPostThumbnail(post);
        return (
          <Link
            key={post.id}
            href={`/p/${post.id}`}
            className="relative aspect-square bg-foreground/5"
          >
            {thumbnail && (
              <Image
                src={thumbnail}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
            )}
            {post.media.type !== "image" && (
              <span className="absolute right-1 top-1">
                <MediaTypeBadge type={post.media.type} />
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
