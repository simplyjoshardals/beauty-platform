"use client";

import { useRef } from "react";
import Image from "next/image";
import { CameraIcon, SpinnerGapIcon } from "@phosphor-icons/react";

type Props = {
  avatarSrc: string;
  onFileSelected: (file: File) => void;
  uploading?: boolean;
  error?: string | null;
};

// File selection is handled by the parent (OnboardingFlow), not here —
// it owns the local preview and holds onto the picked file until the
// user finishes onboarding, when the real upload actually happens.
// This component doesn't need to know any of that.
export function PhotoStep({
  avatarSrc,
  onFileSelected,
  uploading = false,
  error = null,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-lg font-semibold">Add a profile photo</h1>
      <p className="mt-2 text-sm text-foreground/50">
        Help people recognize you. You can always change this later.
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Choose profile photo"
        className="relative mt-8 size-28 shrink-0 overflow-hidden rounded-full"
      >
        <Image
          src={avatarSrc}
          alt=""
          fill
          unoptimized
          className="object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          {uploading ? (
            <SpinnerGapIcon size={22} className="animate-spin text-white" />
          ) : (
            <CameraIcon size={22} weight="fill" className="text-white" />
          )}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
        }}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-3 text-sm font-medium text-foreground disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Choose photo"}
      </button>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
