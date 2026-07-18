"use client";

import { useState } from "react";
import { XIcon, LinkIcon, CheckIcon } from "@phosphor-icons/react";

type Props = {
  open: boolean;
  onClose: () => void;
  url: string;
};

// Only ever shown when navigator.share isn't available on the device/browser
// — this is the fallback path, not the primary one.
export function ShareMenu({ open, onClose, url }: Props) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
      onClose();
    }, 900);
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
          <span className="text-sm font-medium">Share</span>
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
          onClick={handleCopy}
          className="flex w-full items-center gap-3 px-4 py-4 text-sm text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-foreground/10">
            {copied ? (
              <CheckIcon size={18} weight="bold" />
            ) : (
              <LinkIcon size={18} />
            )}
          </span>
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
