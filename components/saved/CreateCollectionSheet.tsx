"use client";

import { useState, type KeyboardEvent } from "react";
import { XIcon } from "@phosphor-icons/react";
import { useSavedPosts } from "@/hooks/useSavedPosts";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateCollectionSheet({ open, onClose }: Props) {
  const { createCollection } = useSavedPosts();
  const [name, setName] = useState("");

  if (!open) return null;

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setName("");
    onClose();
    await createCollection(trimmed);
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

      <div className="relative mx-auto w-full max-w-lg rounded-t-2xl bg-background pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="relative flex items-center justify-center border-b border-foreground/10 py-3">
          <span className="text-sm font-medium">New collection</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <XIcon size={20} className="text-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="Collection name…"
            className="flex-1 rounded-full border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim()}
            className="shrink-0 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-30"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
