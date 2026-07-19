"use client";

import { useState } from "react";
import Image from "next/image";
import { DotsThreeIcon, HeartIcon } from "@phosphor-icons/react";
import type { Post } from "@/types/post";
import type { Comment } from "@/types/comment";
import { getRelativeTime } from "@/utils/time";
import { CURRENT_USER } from "@/constants/currentUser";
import { Carousel } from "./Carousel";
import { VideoPost } from "./VideoPost";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { ProductChips } from "./ProductChips";
import { PostActions } from "./PostActions";
import { PostCaption } from "./PostCaption";
import { CommentSheet } from "./CommentSheet";
import { ShareMenu } from "./ShareMenu";
import { PostOptionsSheet } from "./PostOptionsSheet";
import { useFollow } from "@/context/FollowProvider";
import { PATHS } from "@/utils/paths";

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments ?? []);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const { isFollowing, toggleFollow } = useFollow();
  const isOwnPost = post.author.username === CURRENT_USER.username;

  // Copies immediately, unlike the Share button's flow — this is a direct
  // "Copy link" menu action, not the native-share-or-fallback path.
  async function handleCopyLinkFromOptions() {
    await navigator.clipboard.writeText(shareUrl);
    setShowCopiedToast(true);
    window.setTimeout(() => setShowCopiedToast(false), 1500);
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${PATHS.POST(post.id)}`
      : PATHS.POST(post.id);

  async function handleSharePress() {
    // Feature-detect first: if the browser/OS supports the native share
    // sheet, use it — that's the better experience (real share targets,
    // not just a link). Only fall back to our own menu if it's unavailable.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `${post.author.username} on Vanity`,
          url: shareUrl,
        });
      } catch (err) {
        // AbortError just means the person closed the native sheet
        // themselves — not a real failure, nothing to handle.
        if ((err as Error)?.name !== "AbortError") {
          console.error("Share failed", err);
        }
      }
    } else {
      setShareMenuOpen(true);
    }
  }

  function handleAddComment(text: string, parentId?: string) {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      author: CURRENT_USER,
      text,
      likeCount: 0,
      createdAt: new Date().toISOString(),
    };

    if (!parentId) {
      setComments((prev) => [...prev, newComment]);
    } else {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies ?? []), newComment] }
            : c,
        ),
      );
    }
    setCommentCount((c) => c + 1);
  }

  function toggleLike() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));
  }

  // Double tap always likes — it never unlikes, matching the IG primitive.
  function handleDoubleTap() {
    if (!liked) {
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
    setShowHeartPop(true);
    window.setTimeout(() => setShowHeartPop(false), 600);
  }

  return (
    <article className="border-b border-foreground/10">
      <header className="flex items-center gap-2 px-3 py-2">
        <Image
          src={post.author.avatarSrc}
          alt={post.author.username}
          width={36}
          height={36}
          className="size-9 rounded-full object-cover"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium">{post.author.username}</span>
          {post.author.toneTag && (
            <span className="text-xs text-foreground/50">
              {post.author.toneTag}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOptionsOpen(true)}
          aria-label="Post options"
          className="ml-auto p-2"
        >
          <DotsThreeIcon size={20} className="text-foreground" />
        </button>
      </header>

      <div className="relative" onDoubleClick={handleDoubleTap}>
        {post.media.type === "image" && (
          <div className="relative aspect-square w-full">
            <Image
              src={post.media.src}
              alt={post.media.alt}
              fill
              className="object-cover"
            />
          </div>
        )}
        {post.media.type === "carousel" && (
          <Carousel items={post.media.items} />
        )}
        {post.media.type === "video" && (
          <VideoPost src={post.media.src} poster={post.media.poster} />
        )}
        {post.media.type === "before_after" && (
          <BeforeAfterSlider
            before={post.media.before}
            after={post.media.after}
          />
        )}

        {showHeartPop && (
          <HeartIcon
            weight="fill"
            className="pointer-events-none absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-lg animate-[heartPop_0.6s_ease-out]"
          />
        )}
      </div>

      {post.products && post.products.length > 0 && (
        <ProductChips products={post.products} />
      )}

      <PostActions
        liked={liked}
        saved={saved}
        likeCount={likeCount}
        commentCount={commentCount}
        onToggleLike={toggleLike}
        onToggleSave={() => setSaved((s) => !s)}
        onCommentPress={() => setCommentsOpen(true)}
        onSharePress={handleSharePress}
      />

      <PostCaption username={post.author.username} text={post.caption} />

      <time
        dateTime={post.createdAt}
        className="block px-3 pb-3 text-[11px] uppercase tracking-wide text-foreground/40"
      >
        {getRelativeTime(post.createdAt)}
      </time>

      <CommentSheet
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        comments={comments}
        onAddComment={handleAddComment}
        postAuthorUsername={post.author.username}
      />

      <ShareMenu
        open={shareMenuOpen}
        onClose={() => setShareMenuOpen(false)}
        url={shareUrl}
      />

      <PostOptionsSheet
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        isOwnPost={isOwnPost}
        isFollowing={isFollowing(post.author.username)}
        onToggleFollow={() => toggleFollow(post.author.username)}
        onCopyLinkPress={handleCopyLinkFromOptions}
      />

      {showCopiedToast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-90 mx-auto flex w-full max-w-lg justify-center px-4">
          <div className="rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg">
            Link copied
          </div>
        </div>
      )}
    </article>
  );
}
