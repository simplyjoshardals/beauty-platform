"use client";

import { useState } from "react";
import {
  XIcon,
  LinkIcon,
  BookmarkSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

type Props = {
  open: boolean;
  onClose: () => void;
  isOwnPost: boolean;
  onCopyLinkPress: () => void;
  onSaveToCollectionPress: () => void;
  onDeletePress: () => void;
};

// Follow/Unfollow used to live here as a menu row, but now that PostCard
// shows it directly in the header (one tap, no menu needed), keeping a
// second copy here would just be a redundant, out-of-sync control doing
// the exact same thing.
export function PostOptionsSheet({
  open,
  onClose,
  isOwnPost,
  onCopyLinkPress,
  onSaveToCollectionPress,
  onDeletePress,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!open) return null;

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
