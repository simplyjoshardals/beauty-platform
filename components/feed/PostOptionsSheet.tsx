"use client";

import { useState } from "react";
import {
  XIcon,
  UserMinusIcon,
  UserPlusIcon,
  LinkIcon,
  BookmarkSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

type Props = {
  open: boolean;
  onClose: () => void;
  isOwnPost: boolean;
  isFollowing: boolean;
  followsMe: boolean;
  onToggleFollow: () => void;
  onCopyLinkPress: () => void;
  onSaveToCollectionPress: () => void;
  onDeletePress: () => void;
};

export function PostOptionsSheet({
  open,
  onClose,
  isOwnPost,
  isFollowing,
  followsMe,
  onToggleFollow,
  onCopyLinkPress,
  onSaveToCollectionPress,
  onDeletePress,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!open) return null;

  // Unfollowing is a one-tap, trivially-reversible action — no
  // confirmation needed, unlike deleting a post.
  const followLabel = isFollowing
    ? "Unfollow"
    : followsMe
      ? "Follow back"
      : "Follow";

  function handleDeleteConfirmed() {
    setConfirmingDelete(false);
    onClose();
    onDeletePress();
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-lg rounded-t-2xl bg-background pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="relative flex items-center justify-center border-b border-foreground/10 py-3">
          <span className="text-sm font-medium">Options</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <XIcon size={20} className="text-foreground" />
          </button>
        </div>

        {/* Can't unfollow yourself — this row only shows on other people's posts */}
        {!isOwnPost && (
          <button
            type="button"
            onClick={() => {
              onToggleFollow();
              onClose();
            }}
            className={`flex w-full items-center gap-3 px-4 py-4 text-sm ${
              isFollowing ? "text-red-500" : "text-foreground"
            }`}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-foreground/10">
              {isFollowing ? (
                <UserMinusIcon size={18} />
              ) : (
                <UserPlusIcon size={18} />
              )}
            </span>
            {followLabel}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            onClose();
            onSaveToCollectionPress();
          }}
          className="flex w-full items-center gap-3 px-4 py-4 text-sm text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-foreground/10">
            <BookmarkSimpleIcon size={18} />
          </span>
          Save to collection
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onCopyLinkPress();
          }}
          className="flex w-full items-center gap-3 px-4 py-4 text-sm text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-foreground/10">
            <LinkIcon size={18} />
          </span>
          Copy link
        </button>

        {/* Delete is only ever shown on your own post */}
        {isOwnPost && (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex w-full items-center gap-3 px-4 py-4 text-sm text-red-500"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-foreground/10">
              <TrashIcon size={18} />
            </span>
            Delete post
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this post?"
        description="This can't be undone — the post and its comments will be gone for good."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
