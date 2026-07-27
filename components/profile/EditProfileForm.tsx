"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { XIcon } from "@phosphor-icons/react";
import { useProfile } from "@/context/ProfileProvider";
import { ProductTagEditor } from "@/components/shared/ProductTagEditor";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { validateUsername } from "@/utils/username";
import type { ProductTag } from "@/types/post";

export function EditProfileForm() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const [username, setUsername] = useState(profile.username);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState(profile.avatarSrc);
  const [bio, setBio] = useState(profile.bio);
  const [toneTag, setToneTag] = useState(profile.toneTag);
  const [pinnedRoutine, setPinnedRoutine] = useState<ProductTag[]>(
    profile.pinnedRoutine,
  );
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarSrc(URL.createObjectURL(file));
  }

  function handleSave() {
    const error = validateUsername(username, profile.username);
    if (error) {
      setUsernameError(error);
      return;
    }
    updateProfile({
      username: username.trim().toLowerCase(),
      avatarSrc,
      bio,
      toneTag,
      pinnedRoutine,
    });
    router.back();
  }

  // Only warn if something actually changed from what's already saved —
  // canceling without touching anything shouldn't need confirmation.
  function hasUnsavedChanges() {
    return (
      username !== profile.username ||
      avatarSrc !== profile.avatarSrc ||
      bio !== profile.bio ||
      toneTag !== profile.toneTag ||
      JSON.stringify(pinnedRoutine) !== JSON.stringify(profile.pinnedRoutine)
    );
  }

  function handleCancelPress() {
    if (hasUnsavedChanges()) {
      setConfirmingDiscard(true);
    } else {
      router.back();
    }
  }

  return (
    <div className="fixed left-1/2 top-0 bottom-0 z-80 w-full max-w-lg -translate-x-1/2 flex flex-col bg-background">
      <header className="flex items-center justify-between border-b border-foreground/10 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <button type="button" onClick={handleCancelPress} aria-label="Cancel">
          <XIcon size={22} className="text-foreground" />
        </button>
        <span className="text-sm font-medium">Edit profile</span>
        <button
          type="button"
          onClick={handleSave}
          className="text-sm font-medium text-foreground"
        >
          Save
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="mb-6 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            aria-label="Change profile photo"
            className="relative size-24 overflow-hidden rounded-full"
          >
            <Image
              src={avatarSrc}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </button>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="text-sm font-medium text-foreground"
          >
            Change photo
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelected}
            className="hidden"
          />
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs text-foreground/50">
            Username
          </label>
          <div className="flex items-center rounded-lg border border-foreground/15 px-3 py-2">
            <span className="text-sm text-foreground/40">@</span>
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(null);
              }}
              autoCapitalize="none"
              autoCorrect="off"
              className="flex-1 bg-transparent pl-1 text-sm outline-none"
            />
          </div>
          {usernameError && (
            <p className="mt-1.5 text-xs text-red-500">{usernameError}</p>
          )}
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs text-foreground/50">
            Tone tag
          </label>
          <input
            value={toneTag}
            onChange={(e) => setToneTag(e.target.value)}
            placeholder="e.g. Combination skin"
            className="w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-xs text-foreground/50">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell people about yourself…"
            className="w-full resize-none rounded-lg border border-foreground/15 bg-transparent p-3 text-sm outline-none"
          />
        </div>

        <ProductTagEditor
          label="Pinned routine"
          placeholder="e.g. Cleanser: CeraVe Foaming"
          products={pinnedRoutine}
          onChange={setPinnedRoutine}
        />
      </div>

      <ConfirmDialog
        open={confirmingDiscard}
        title="Discard changes?"
        description="Your edits won't be saved."
        confirmLabel="Discard"
        destructive
        onConfirm={() => router.back()}
        onCancel={() => setConfirmingDiscard(false)}
      />
    </div>
  );
}
