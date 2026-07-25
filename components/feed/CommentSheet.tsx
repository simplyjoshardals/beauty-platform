"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { XIcon, PaperPlaneRightIcon } from "@phosphor-icons/react";
import type { Comment } from "@/types/comment";
import { CURRENT_USER } from "@/constants/currentUser";
import { sortByAuthorEngagement } from "@/utils/sortComments";
import { CommentItem } from "./CommentItem";
import { CommentSheetSkeleton } from "./CommentSheetSkeleton";
import { useAuthGatedAction } from "@/hooks/useAuthGatedAction";
import { AuthGateModal } from "@/components/auth/AuthGateModal";

type Props = {
  open: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (text: string, parentId?: string) => void;
  onDeleteComment: (commentId: string, topLevelId?: string) => void;
  postAuthorUsername: string;
};

export function CommentSheet({
  open,
  onClose,
  comments,
  onAddComment,
  onDeleteComment,
  postAuthorUsername,
}: Props) {
  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    topLevelId: string;
    username: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { gateOpen, gateMessage, closeGate, guard } = useAuthGatedAction();

  // Simulated so the skeleton is actually visible — swap this whole effect
  // for a real "comments are being fetched" flag once there's a real API.
  // Resets each time the sheet opens since the component doesn't unmount
  // between opens (it just returns null), so state would otherwise persist.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 800);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Author's own comments lead, then threads they've replied to, then
  // untouched comments — see sortByAuthorEngagement for the tier logic.
  const sortedComments = useMemo(
    () => sortByAuthorEngagement(comments, postAuthorUsername),
    [comments, postAuthorUsername],
  );

  if (!open) return null;

  function handleReplyPress(topLevelId: string, username: string) {
    setReplyingTo({ topLevelId, username });
    setDraft("");
    inputRef.current?.focus();
  }

  function cancelReply() {
    setReplyingTo(null);
    setDraft("");
  }

  function handleSubmit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    // The @mention is stitched on here, never in the editable field itself —
    // that's what makes it impossible for the user to backspace out.
    // Skipped entirely when replying to your own comment — mentioning
    // yourself is just noise.
    const isReplyingToSelf = replyingTo?.username === CURRENT_USER.username;
    const finalText =
      replyingTo && !isReplyingToSelf
        ? `@${replyingTo.username} ${trimmed}`
        : trimmed;
    onAddComment(finalText, replyingTo?.topLevelId);
    setDraft("");
    setReplyingTo(null);
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative mx-auto flex h-[80dvh] w-full max-w-lg flex-col rounded-t-2xl bg-background">
        <div className="relative flex items-center justify-center border-b border-foreground/10 py-3">
          <span className="text-sm font-medium">Comments</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <XIcon size={20} className="text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {loading ? (
            <CommentSheetSkeleton />
          ) : sortedComments.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-foreground/50">
              No comments yet. Say something nice.
            </p>
          ) : (
            sortedComments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                postAuthorUsername={postAuthorUsername}
                onReplyPress={handleReplyPress}
                onDeleteComment={onDeleteComment}
                guard={guard}
              />
            ))
          )}
        </div>

        {replyingTo && (
          <div className="flex items-center justify-between border-t border-foreground/10 px-3 py-1.5 text-xs text-foreground/50">
            <span>
              {replyingTo.username === CURRENT_USER.username ? (
                "Replying to your comment"
              ) : (
                <>
                  Replying to{" "}
                  <span className="font-medium">@{replyingTo.username}</span>
                </>
              )}
            </span>
            <button
              type="button"
              onClick={cancelReply}
              aria-label="Cancel reply"
            >
              <XIcon size={14} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-foreground/10 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              guard(handleSubmit, "Sign in to leave a comment.")()
            }
            placeholder={
              replyingTo
                ? replyingTo.username === CURRENT_USER.username
                  ? "Add to your comment…"
                  : `Reply to @${replyingTo.username}…`
                : "Add a comment…"
            }
            className="flex-1 rounded-full border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={guard(handleSubmit, "Sign in to leave a comment.")}
            disabled={!draft.trim()}
            aria-label="Post comment"
            className="flex size-9 items-center justify-center text-foreground disabled:opacity-30"
          >
            <PaperPlaneRightIcon size={20} weight="fill" />
          </button>
        </div>
      </div>

      <AuthGateModal
        open={gateOpen}
        onClose={closeGate}
        message={gateMessage}
      />
    </div>
  );
}
