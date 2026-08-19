"use client";

import { useState, type KeyboardEvent } from "react";
import { XIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

type Props = {
  open: boolean;
  onClose: () => void;
  collectionId: string;
  currentName: string;
  // Caller navigates away after a delete, since the page being viewed no
  // longer has anything to show.
  onDeleted: () => void;
};

export function CollectionOptionsSheet({
  open,
  onClose,
  collectionId,
  currentName,
  onDeleted,
}: Props) {
  const { renameCollection, deleteCollection } = useSavedPosts();
  const [mode, setMode] = useState<"menu" | "rename">("menu");
  const [name, setName] = useState(currentName);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!open) return null;

  function handleClose() {
    setMode("menu");
    setName(currentName);
    onClose();
  }

  function handleSaveRename() {
    const trimmed = name.trim();
    if (!trimmed) return;
    renameCollection(collectionId, trimmed);
    handleClose();
  }

  function handleDeleteConfirmed() {
    deleteCollection(collectionId);
    setConfirmingDelete(false);
    handleClose();
    onDeleted();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveRename();
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-lg rounded-t-2xl bg-background pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="relative flex items-center justify-center border-b border-foreground/10 py-3">
          <span className="text-sm font-medium">
            {mode === "menu" ? "Collection options" : "Rename collection"}
          </span>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <XIcon size={20} className="text-foreground" />
          </button>
        </div>

        {mode === "menu" ? (
          <>
            <button
              type="button"
              onClick={() => setMode("rename")}
              className="flex w-full items-center gap-3 px-4 py-4 text-sm text-foreground"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-foreground/10">
                <PencilSimpleIcon size={18} />
              </span>
              Rename collection
            </button>

            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex w-full items-center gap-3 px-4 py-4 text-sm text-red-500"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-foreground/10">
                <TrashIcon size={18} />
              </span>
              Delete collection
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 px-4 py-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="flex-1 rounded-full border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <button
              type="button"
              onClick={handleSaveRename}
              disabled={!name.trim()}
              className="shrink-0 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-30"
            >
              Save
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete "${currentName}"?`}
        description="Posts inside will stay saved elsewhere — this collection itself will be gone for good."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
