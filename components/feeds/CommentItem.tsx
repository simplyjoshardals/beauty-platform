"use client";

import { useState } from "react";
import Image from "next/image";
import { HeartIcon } from "@phosphor-icons/react";
import type { Comment } from "@/types/comment";
import { getRelativeTime } from "@/utils/time";

type Props = {
  comment: Comment;
  postAuthorUsername: string;
  onReplyPress: (topLevelId: string, username: string) => void;
  // Present only when this CommentItem is being rendered as a reply —
  // points back at the root comment replies attach to. Omitted for
  // top-level comments, where the comment IS the top-level one.
  topLevelId?: string;
};

export function CommentItem({
  comment,
  postAuthorUsername,
  onReplyPress,
  topLevelId,
}: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(comment.likeCount);
  const [repliesExpanded, setRepliesExpanded] = useState(
    (comment.replies?.length ?? 0) > 0,
  );

  const isAuthor = comment.author.username === postAuthorUsername;
  const isReply = topLevelId !== undefined;
  const replyTargetId = topLevelId ?? comment.id;

  function toggleLike() {
    setLiked((prev) => {
      const next = !prev;
      setCount((c) => c + (next ? 1 : -1));
      return next;
    });
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
          </div>
        </div>
        <button
          type="button"
          onClick={toggleLike}
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

      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="mt-1 pl-8">
          {repliesExpanded ? (
            <>
              <div className="flex flex-col gap-2 border-l border-foreground/10 pl-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    postAuthorUsername={postAuthorUsername}
                    onReplyPress={onReplyPress}
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
      )}
    </div>
  );
}
