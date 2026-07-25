"use client";

import { useRef } from "react";
import Image from "next/image";
import { CameraIcon } from "@phosphor-icons/react";

type Props = {
  avatarSrc: string;
  onAvatarChange: (src: string) => void;
};

export function PhotoStep({ avatarSrc, onAvatarChange }: Props) {
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
          <CameraIcon size={22} weight="fill" className="text-white" />
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAvatarChange(URL.createObjectURL(file));
        }}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-3 text-sm font-medium text-foreground"
      >
        Choose photo
      </button>
    </div>
  );
}
