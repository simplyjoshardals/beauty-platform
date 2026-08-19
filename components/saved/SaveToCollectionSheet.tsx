"use client";

import { useState, type KeyboardEvent } from "react";
import { XIcon, CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { useSavedPosts } from "@/hooks/useSavedPosts";

type Props = {
  open: boolean;
  onClose: () => void;
  postId: string;
};

export function SaveToCollectionSheet({ open, onClose, postId }: Props) {
  const {
    collections,
    createCollection,
    isPostInCollection,
    toggleCollectionForPost,
  } = useSavedPosts();
  const [newName, setNewName] = useState("");

  if (!open) return null;

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setNewName("");
    const id = await createCollection(trimmed);
    if (id) toggleCollectionForPost(postId, id);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative mx-auto flex max-h-[80dvh] w-full max-w-lg flex-col rounded-t-2xl bg-background pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="relative flex items-center justify-center border-b border-foreground/10 py-3">
          <span className="text-sm font-medium">Save to collection</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <XIcon size={20} className="text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {collections.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-foreground/50">
              No collections yet. Create one below.
            </p>
          ) : (
            collections.map((collection) => {
              const inCollection = isPostInCollection(postId, collection.id);
              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => toggleCollectionForPost(postId, collection.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm"
                >
                  <span>{collection.name}</span>
                  {inCollection && (
                    <CheckIcon
                      size={18}
                      weight="bold"
                      className="text-foreground"
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-foreground/10 px-4 py-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New collection name…"
            className="flex-1 rounded-full border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newName.trim()}
            aria-label="Create collection"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-foreground/15 disabled:opacity-30"
          >
            <PlusIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
