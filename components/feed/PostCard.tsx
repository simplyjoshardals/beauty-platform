"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { DotsThreeIcon, HeartIcon } from "@phosphor-icons/react";
import type { Post } from "@/types/post";
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
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { usePosts } from "@/hooks/usePosts";
import { useLikedPosts } from "@/hooks/useLikedPosts";
import { useComments } from "@/hooks/useComments";
import { PATHS } from "@/utils/paths";
import { useAuthGatedAction } from "@/hooks/useAuthGatedAction";
import { AuthGateModal } from "@/components/auth/AuthGateModal";

export function PostCard({ post }: { post: Post }) {
  // Same real backend the profile header now uses (see
  // hooks/useUserProfile.ts and app/u/[username]/page.tsx) — isFollowing
  // and followsMe come off the Follow table, and toggleFollow does the
  // same optimistic update/rollback via React Query. Multiple PostCards
  // for the same author share one cached query (React Query dedupes by
  // queryKey), so a repeat author in the feed doesn't mean a repeat
  // request. This is still the FIRST of PostCard/NotificationRow/
  // UserListRow to move off context/FollowProvider's local Set — the
  // other two are a separate pass, so following someone from a post
  // card here won't yet be reflected on their row in, say, the
  // Following list until that migration happens too.
  const { user: authorProfile, toggleFollow } = useUserProfile(
    post.author.username,
  );
  const { deletePost } = usePosts();
  const router = useRouter();
  const pathname = usePathname();
  const { gateOpen, gateMessage, closeGate, guard } = useAuthGatedAction();
  const { isAuthenticated } = useCurrentUser();
  const { user } = useCurrentUser();
  const { isSaved, toggleSave } = useSavedPosts();
  const { isLiked, toggleLike: toggleLikeMutation } = useLikedPosts();
  const liked = isLiked(post.id);
  // Post.likeCount/commentCount are derived server-side via _count (see
  // prisma/schema.prisma), so they only catch up to a like/comment once
  // useLikedPosts/useComments invalidate the posts query and this prop
  // updates — these local mirrors give instant feedback in between,
  // synced back to the real value whenever it changes.
  const [likeCount, setLikeCount] = useState(post.likeCount);
  useEffect(() => setLikeCount(post.likeCount), [post.likeCount]);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const {
    comments,
    addComment,
    deleteComment,
    toggleCommentLike,
    isLoading: commentsLoading,
  } = useComments(post.id, { enabled: commentsOpen, currentUser: user });
  const [commentCount, setCommentCount] = useState(post.commentCount);
  useEffect(() => setCommentCount(post.commentCount), [post.commentCount]);
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

  // Thin wrappers around useComments — the actual add/delete logic (incl.
  // the placeholder-vs-full-removal rule) now lives server-side in
  // app/api/posts/[postId]/comments/**, mirrored optimistically inside
  // the hook itself. commentCount is bumped/dropped here to match, and
  // resyncs to the real Post.commentCount once that mutation settles
  // (see the useEffect above).
  function handleAddComment(
    text: string,
    parentId?: string,
    replyToUserId?: string,
  ) {
    if (!user) return;
    addComment(text, parentId, replyToUserId);
    setCommentCount((c) => c + 1);
  }

  function handleDeleteComment(commentId: string, topLevelId?: string) {
    if (topLevelId) {
      deleteComment(commentId, topLevelId);
      setCommentCount((count) => Math.max(0, count - 1));
      return;
    }

    const target = comments.find((c) => c.id === commentId);
    const hasReplies = (target?.replies?.length ?? 0) > 0;
    deleteComment(commentId);
    if (!hasReplies) {
      setCommentCount((count) => Math.max(0, count - 1));
    }
  }

  function toggleLike() {
    const nextLiked = !liked;
    toggleLikeMutation(post.id);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));
  }

  // Double tap always likes — it never unlikes, matching the IG primitive.
  function handleDoubleTap() {
    if (!liked) {
      toggleLikeMutation(post.id);
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

        <Link
          href={PATHS.USER_PROFILE(post.author.username)}
          className="flex flex-1 flex-col leading-tight"
        >
          <span className="text-sm font-medium">{post.author.username}</span>
          {post.author.toneTag && (
            <span className="text-xs text-foreground/50">
              {post.author.toneTag}
            </span>
          )}
        </Link>

        {/* Same solid/outline pill used for Follow everywhere else in the
            app (UserListRow, ProfileHeader) — a real tappable button
            instead of text buried in the username row. Sibling of the
            username Link above, not nested inside it. */}
        {!isOwnPost && (
          <button
            type="button"
            onClick={guard(toggleFollow)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              authorProfile?.isFollowing
                ? "border border-foreground/15 text-foreground"
                : "bg-foreground text-background"
            }`}
          >
            {authorProfile?.isFollowing
              ? "Following"
              : authorProfile?.followsMe
                ? "Follow back"
                : "Follow"}
          </button>
        )}

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
        loading={commentsLoading}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onToggleCommentLike={toggleCommentLike}
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
