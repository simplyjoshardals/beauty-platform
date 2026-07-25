"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { HeartIcon } from "@phosphor-icons/react";
import type { Comment } from "@/types/comment";
import { getRelativeTime } from "@/utils/time";
import { sortAuthorFirst } from "@/utils/sortComments";
import { CURRENT_USER } from "@/constants/currentUser";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

type Props = {
  comment: Comment;
  postAuthorUsername: string;
  onReplyPress: (topLevelId: string, username: string) => void;
  // topLevelId param: present when deleting a reply (points at its parent),
  // omitted when deleting a top-level comment directly.
  onDeleteComment: (commentId: string, topLevelId?: string) => void;
  // Same guard function CommentSheet uses for posting a comment — reused
  // here so liking a comment/reply shares the same auth-gate modal instead
  // of each CommentItem needing its own.
  guard: (fn: () => void, message?: string) => () => void;
  // Present only when this CommentItem is being rendered as a reply —
  // points back at the root comment replies attach to. Omitted for
  // top-level comments, where the comment IS the top-level one.
  topLevelId?: string;
};

export function CommentItem({
  comment,
  postAuthorUsername,
  onReplyPress,
  onDeleteComment,
  guard,
  topLevelId,
}: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(comment.likeCount);
  const [repliesExpanded, setRepliesExpanded] = useState(
    (comment.replies?.length ?? 0) > 0,
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isAuthor = comment.author.username === postAuthorUsername;
  const isReply = topLevelId !== undefined;
  const replyTargetId = topLevelId ?? comment.id;
  const hasReplies = (comment.replies?.length ?? 0) > 0;

  // Own comment, or the post's own author moderating their post — either
  // can delete. Nothing to delete twice on an already-deleted comment.
  const canDelete =
    !comment.deleted &&
    (comment.author.username === CURRENT_USER.username ||
      postAuthorUsername === CURRENT_USER.username);

  const sortedReplies = useMemo(
    () =>
      comment.replies
        ? sortAuthorFirst(comment.replies, postAuthorUsername)
        : [],
    [comment.replies, postAuthorUsername],
  );

  function toggleLike() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));
  }

  function handleDeleteConfirmed() {
    onDeleteComment(comment.id, topLevelId);
    setConfirmingDelete(false);
  }

  // Shared between the normal render and the deleted-placeholder render —
  // replies stay fully intact and readable either way, only the parent
  // comment's own content differs.
  const repliesSection = !isReply &&
    comment.replies &&
    comment.replies.length > 0 && (
      <div className="mt-1 pl-8">
        {repliesExpanded ? (
          <>
            <div className="flex flex-col gap-2 border-l border-foreground/10 pl-3">
              {sortedReplies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postAuthorUsername={postAuthorUsername}
                  onReplyPress={onReplyPress}
                  onDeleteComment={onDeleteComment}
                  guard={guard}
                  topLevelId={comment.id}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRepliesExpanded(false)}
              className="mt-1 text-xs font-medium text-foreground/50"
            >
              Hide replies
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setRepliesExpanded(true)}
            className="text-xs font-medium text-foreground/50"
          >
            — View {comment.replies.length}{" "}
            {comment.replies.length === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>
    );

  if (comment.deleted) {
    return (
      <div className={isReply ? "" : "px-3 py-2"}>
        <div className="flex gap-2">
          <div
            className={`shrink-0 rounded-full bg-foreground/10 ${isReply ? "size-6.5" : "size-8"}`}
          />
          <div className="flex-1 pt-0.5">
            <p className="text-sm italic text-foreground/40">Comment deleted</p>
          </div>
        </div>
        {repliesSection}
      </div>
    );
  }

  return (
    <div className={isReply ? "" : "px-3 py-2"}>
      <div className="flex gap-2">
        <Image
          src={comment.author.avatarSrc}
          alt={comment.author.username}
          width={isReply ? 26 : 32}
          height={isReply ? 26 : 32}
          className={`shrink-0 rounded-full object-cover ${isReply ? "size-6.5" : "size-8"}`}
        />
        <div className="flex-1">
          <p className="text-sm leading-snug">
            <span className="font-medium">{comment.author.username}</span>
            {isAuthor && (
              <span className="ml-1.5 align-middle text-[10px] font-medium uppercase tracking-wide text-foreground/40">
                Author
              </span>
            )}{" "}
            {comment.text}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-foreground/50">
            <time dateTime={comment.createdAt}>
              {getRelativeTime(comment.createdAt)}
            </time>
            <button
              type="button"
              onClick={() =>
                onReplyPress(replyTargetId, comment.author.username)
              }
              className="font-medium"
            >
              Reply
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="font-medium text-red-500"
              >
                Delete
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={guard(toggleLike, "Sign in to like this comment.")}
          aria-label={liked ? "Unlike comment" : "Like comment"}
          className="flex flex-col items-center gap-0.5 pt-0.5"
        >
          <HeartIcon
            size={14}
            weight={liked ? "fill" : "regular"}
            className={liked ? "text-red-500" : "text-foreground/40"}
          />
          {count > 0 && (
            <span className="text-[10px] text-foreground/40">{count}</span>
          )}
        </button>
      </div>

      {repliesSection}

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this comment?"
        description={
          !isReply && hasReplies
            ? "Replies will stay visible, but this comment will be replaced with a placeholder."
            : "This can't be undone."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
