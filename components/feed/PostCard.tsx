"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { DotsThreeIcon, HeartIcon } from "@phosphor-icons/react";
import type { Post } from "@/types/post";
import type { Comment } from "@/types/comment";
import { getRelativeTime } from "@/utils/time";
import { getPostThumbnail } from "@/utils/postThumbnail";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Carousel } from "./Carousel";
import { VideoPost } from "./VideoPost";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { ProductChips } from "./ProductChips";
import { PostActions } from "./PostActions";
import { PostCaption } from "./PostCaption";
import { CommentSheet } from "./CommentSheet";
import { ShareMenu } from "./ShareMenu";
import { PostOptionsSheet } from "./PostOptionsSheet";
import { SaveToCollectionSheet } from "@/components/saved/SaveToCollectionSheet";
import { useFollow } from "@/context/FollowProvider";
import { useSavedPosts } from "@/context/SavedPostsProvider";
import { usePosts } from "@/hooks/usePosts";
import { isMockFollowerOfCurrentUser } from "@/data/mockFollowers";
import { PATHS } from "@/utils/paths";
import { useAuthGatedAction } from "@/hooks/useAuthGatedAction";
import { AuthGateModal } from "@/components/auth/AuthGateModal";

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const { isFollowing, toggleFollow } = useFollow();
  const { deletePost } = usePosts();
  const router = useRouter();
  const pathname = usePathname();
  const followsMe = isMockFollowerOfCurrentUser(post.author.username);
  const { gateOpen, gateMessage, closeGate, guard } = useAuthGatedAction();
  const { isAuthenticated } = useCurrentUser();
  const { user } = useCurrentUser();
  const { isSaved, toggleSave } = useSavedPosts();
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments ?? []);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // The URL hash is what makes the comment sheet survive a REAL
  // navigation away and back — e.g. tapping a commenter's avatar to view
  // their profile, then pressing back. Local state alone can't do this:
  // that navigation unmounts PostCard entirely, and a fresh useState(false)
  // has no memory the sheet used to be open. The hash does, because the
  // browser restores it as part of the actual URL when you go back.
  const commentsHash = `#comments-${post.id}`;

  useEffect(() => {
    // Reopen on mount if we're arriving at a URL that still points here.
    if (window.location.hash === commentsHash) {
      setCommentsOpen(true);
    }

    // Back button/gesture while still on this same page: if the hash no
    // longer matches, close — this is the "just press back to dismiss"
    // case that doesn't involve leaving the page at all.
    function handlePopState() {
      if (window.location.hash !== commentsHash) {
        setCommentsOpen(false);
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [commentsHash]);

  function openComments() {
    window.history.pushState(null, "", commentsHash);
    setCommentsOpen(true);
  }

  function closeComments() {
    if (window.location.hash === commentsHash) {
      window.history.back();
    }
    setCommentsOpen(false);
  }
  const [saveToCollectionOpen, setSaveToCollectionOpen] = useState(false);
  // Compares by id, not username — stays correct even if I rename myself
  // after this post already exists. Sourced from the real authenticated
  // session (useCurrentUser) rather than the old hardcoded constant, so
  // this is correct for whoever is actually logged in, not just a fixed
  // dev-time user.
  const isOwnPost = Boolean(user) && post.author.id === user?.id;

  function handleDeletePress() {
    deletePost(post.id);
    // If we're on this post's own permalink page, there's nothing left to
    // show here — bounce back to the feed. Elsewhere (feed, grid), the
    // post just disappears from the list reactively, no navigation needed.
    if (pathname === PATHS.POST(post.id)) {
      router.replace(PATHS.HOME);
    }
  }

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
    if (!user) return;

    const newComment: Comment = {
      id: crypto.randomUUID(),
      // Live profile data, not the old static constant — this also means
      // a comment you post right after changing your avatar/username
      // actually shows the new one, instead of whatever was baked in at
      // build time.
      author: {
        id: user.id,
        username: user.username,
        avatarSrc: user.avatarSrc,
      },
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

  // Reading `comments` from component scope (not nested inside a setState
  // updater) rather than computing hasReplies inside the updater itself —
  // same reasoning as the earlier like-count bug: don't nest one setState
  // call's logic inside another's functional updater.
  function handleDeleteComment(commentId: string, topLevelId?: string) {
    if (topLevelId) {
      // Deleting a reply — always a full silent removal. Replies never
      // have their own sub-replies to preserve, so there's nothing to
      // keep a placeholder for.
      setComments((prev) =>
        prev.map((c) =>
          c.id === topLevelId
            ? {
                ...c,
                replies: (c.replies ?? []).filter((r) => r.id !== commentId),
              }
            : c,
        ),
      );
      setCommentCount((count) => Math.max(0, count - 1));
      return;
    }

    const target = comments.find((c) => c.id === commentId);
    const hasReplies = (target?.replies?.length ?? 0) > 0;

    if (hasReplies) {
      // Structural placeholder — replies stay fully intact underneath.
      // Not decremented: the placeholder still occupies a real slot in
      // the thread, unlike a fully-removed leaf comment.
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, deleted: true } : c)),
      );
    } else {
      // No replies — true silent removal, no trace left behind.
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentCount((count) => Math.max(0, count - 1));
    }
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
        <Link
          href={PATHS.USER_PROFILE(post.author.username)}
          className="shrink-0"
        >
          <Image
            src={post.author.avatarSrc}
            alt={post.author.username}
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
        </Link>

        <div className="flex flex-1 flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <Link
              href={PATHS.USER_PROFILE(post.author.username)}
              className="text-sm font-medium"
            >
              {post.author.username}
            </Link>
            {/* Sibling of the username Link, not nested inside it — a
                button inside an anchor is invalid HTML and would also
                fire the profile-navigation on every follow tap. */}
            {!isOwnPost && (
              <>
                <span className="text-foreground/30">·</span>
                <button
                  type="button"
                  onClick={guard(() => toggleFollow(post.author.username))}
                  className="text-xs font-medium text-foreground/60"
                >
                  {isFollowing(post.author.username)
                    ? "Following"
                    : followsMe
                      ? "Follow back"
                      : "Follow"}
                </button>
              </>
            )}
          </div>
          {post.author.toneTag && (
            <span className="text-xs text-foreground/50">
              {post.author.toneTag}
            </span>
          )}
        </div>

        {isAuthenticated && (
          <button
            type="button"
            onClick={() => setOptionsOpen(true)}
            aria-label="Post options"
            className="p-2"
          >
            <DotsThreeIcon size={20} className="text-foreground" />
          </button>
        )}
      </header>

      <div className="relative" onDoubleClick={guard(handleDoubleTap)}>
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
          <VideoPost
            src={post.media.src}
            poster={getPostThumbnail(post) ?? ""}
          />
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
        saved={isSaved(post.id)}
        likeCount={likeCount}
        commentCount={commentCount}
        onToggleLike={guard(toggleLike)}
        onToggleSave={guard(() => toggleSave(post.id))}
        onCommentPress={openComments}
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
        onClose={closeComments}
        comments={comments}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        postAuthorId={post.author.id}
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
        onCopyLinkPress={handleCopyLinkFromOptions}
        onSaveToCollectionPress={guard(() => setSaveToCollectionOpen(true))}
        onDeletePress={handleDeletePress}
      />

      <SaveToCollectionSheet
        open={saveToCollectionOpen}
        onClose={() => setSaveToCollectionOpen(false)}
        postId={post.id}
      />

      {showCopiedToast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-90 mx-auto flex w-full max-w-lg justify-center px-4">
          <div className="rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg">
            Link copied
          </div>
        </div>
      )}

      <AuthGateModal
        open={gateOpen}
        onClose={closeGate}
        message={gateMessage}
      />
    </article>
  );
}
