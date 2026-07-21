"use client";

import { PlusIcon } from "@phosphor-icons/react";

export function CreateCollectionTile({ onPress }: { onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-foreground/20 text-foreground/40"
    >
      <PlusIcon size={22} />
      <span className="text-xs font-medium">New collection</span>
    </button>
  );
}
