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

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments ?? []);
  const [commentCount, setCommentCount] = useState(post.commentCount);

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
        <button type="button" aria-label="More options" className="ml-auto p-2">
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
    </article>
  );
}
