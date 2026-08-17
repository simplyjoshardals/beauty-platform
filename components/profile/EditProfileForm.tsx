"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { XIcon } from "@phosphor-icons/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useUploadMedia } from "@/hooks/useUploadMedia";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import { ProductTagEditor } from "@/components/shared/ProductTagEditor";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { validateUsername } from "@/utils/username";
import type { ProductTag } from "@/types/post";

export function EditProfileForm() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { mutateAsync: saveProfile, isPending: saving } = useUpdateProfile();
  const { mutateAsync: uploadAvatar, isPending: avatarUploading } =
    useUploadMedia();

  const [username, setUsername] = useState(user?.username ?? "");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  // Doubles as both the preview URL AND the "is this real yet" signal,
  // same convention as onboarding's PhotoStep: a blob: URL means a local
  // pick that hasn't been uploaded yet; anything else is already a real
  // hosted URL, safe to submit as-is.
  const [avatarSrc, setAvatarSrc] = useState(user?.avatarSrc ?? "");
  // The raw File from the most recent pick, held onto until Save — we
  // upload once, right before submitting, instead of on every pick.
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [bio, setBio] = useState(user?.bio ?? "");
  const [toneTag, setToneTag] = useState(user?.toneTag ?? "");
  const [pinnedRoutine, setPinnedRoutine] = useState<ProductTag[]>(
    user?.pinnedRoutine ?? [],
  );
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // RequireAuth (wrapping the page this form lives on) already blocks
  // rendering until useCurrentUser resolves, so `user` is expected
  // non-null by the time this mounts. This effect just backfills local
  // state in case the query result arrives a tick after first render,
  // the same defensive pattern OnboardingFlow uses for avatarSrc.
  useEffect(() => {
    if (!user) return;
    setUsername(user.username);
    setAvatarSrc(user.avatarSrc);
    setBio(user.bio);
    setToneTag(user.toneTag);
    setPinnedRoutine(user.pinnedRoutine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const { status: usernameCheckStatus } = useUsernameAvailability(
    username,
    user?.username,
  );

  function handleAvatarSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    // Swapping to a new pick — drop the previous local preview URL so
    // repeated swaps don't leak blob: URLs, then swap in the new one.
    if (avatarSrc.startsWith("blob:")) URL.revokeObjectURL(avatarSrc);
    setAvatarSrc(URL.createObjectURL(file));
    setAvatarFile(file);
  }

  async function handleSave() {
    if (!user) return;

    const error = validateUsername(username);
    if (error) {
      setUsernameError(error);
      return;
    }
    if (usernameCheckStatus === "taken") {
      setUsernameError("That username is already taken.");
      return;
    }
    if (usernameCheckStatus === "checking") {
      return;
    }

    setSubmitError(null);

    // Only the LAST photo picked ever actually gets uploaded, and only
    // once, right here. An avatar left untouched (still the real,
    // already-hosted URL) is submitted as-is.
    let realAvatarSrc = avatarSrc.startsWith("blob:") ? undefined : avatarSrc;

    if (avatarFile) {
      const result = await uploadAvatar({
        file: avatarFile,
        context: "avatar",
      });

      if (result.success) {
        realAvatarSrc = result.url;
      } else {
        setAvatarError(result.error);
        return;
      }
    }

    const result = await saveProfile({
      username: username.trim().toLowerCase(),
      avatarSrc: realAvatarSrc,
      bio,
      toneTag,
      pinnedRoutine,
    });

    if (!result?.success) {
      if (result?.error?.toLowerCase().includes("taken")) {
        setUsernameError(result.error);
      } else {
        setSubmitError(
          result?.error || "Something went wrong. Please try again.",
        );
      }
      return;
    }

    router.back();
  }

  // Only warn if something actually changed from what's already saved —
  // canceling without touching anything shouldn't need confirmation.
  function hasUnsavedChanges() {
    if (!user) return false;
    return (
      username !== user.username ||
      avatarSrc !== user.avatarSrc ||
      bio !== user.bio ||
      toneTag !== user.toneTag ||
      JSON.stringify(pinnedRoutine) !== JSON.stringify(user.pinnedRoutine)
    );
  }

  function handleCancelPress() {
    if (hasUnsavedChanges()) {
      setConfirmingDiscard(true);
    } else {
      router.back();
    }
  }

  const saveDisabled =
    saving ||
    avatarUploading ||
    usernameCheckStatus === "checking" ||
    !hasUnsavedChanges();

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
          disabled={saveDisabled}
          className="text-sm font-medium text-foreground disabled:opacity-50"
        >
          {avatarUploading || saving ? "Saving…" : "Save"}
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
          {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}
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

        {submitError && (
          <p className="mt-4 text-center text-xs text-red-500">{submitError}</p>
        )}
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
