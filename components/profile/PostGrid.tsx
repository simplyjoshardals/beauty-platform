import Image from "next/image";
import Link from "next/link";
import {
  VideoCameraIcon,
  StackIcon,
  ArrowsLeftRightIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { Post } from "@/types/post";
import { getPostThumbnail } from "@/utils/postThumbnail";
import { PATHS } from "@/utils/paths";

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

type Props = {
  posts: Post[];
  emptyTitle?: string;
  emptyDescription?: string;
  // When provided, each tile gets a remove (×) button. Omitted entirely on
  // the profile grid — removing a post from your own profile doesn't mean
  // anything there; this only makes sense in a saved-collection context.
  onRemove?: (postId: string) => void;
};

export function PostGrid({
  posts,
  emptyTitle = "No posts yet",
  emptyDescription = "Posts you share will show up here.",
  onRemove,
}: Props) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 px-6 py-16 text-center">
        <p className="text-sm font-medium">{emptyTitle}</p>
        <p className="text-sm text-foreground/50">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map((post) => {
        const thumbnail = getPostThumbnail(post);
        return (
          <div key={post.id} className="relative aspect-square bg-foreground/5">
            <Link href={PATHS.POST(post.id)} className="absolute inset-0">
              {thumbnail && (
                <Image
                  src={thumbnail}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              )}
            </Link>

            {post.media.type !== "image" && (
              <span className="pointer-events-none absolute right-1 top-1">
                <MediaTypeBadge type={post.media.type} />
              </span>
            )}

            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(post.id)}
                aria-label="Remove from this collection"
                className="absolute left-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <XIcon size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
