"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCompleteOnboarding } from "@/hooks/useCompleteOnboarding";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import { useUploadMedia } from "@/hooks/useUploadMedia";
import { PATHS } from "@/utils/paths";
import { validateUsername } from "@/utils/username";
import { UsernameStep } from "./UsernameStep";
import { PhotoStep } from "./PhotoStep";
import { AboutStep } from "./AboutStep";

const TOTAL_STEPS = 3;

export function OnboardingFlow() {
  const router = useRouter();
  const { user, needsOnboarding, isLoading: userLoading } = useCurrentUser();
  const { mutateAsync: submitOnboarding, isPending: submitting } =
    useCompleteOnboarding();
  const { mutateAsync: uploadAvatar, isPending: avatarUploading } =
    useUploadMedia();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState(""); // never pre-fill the random placeholder
  const [usernameError, setUsernameError] = useState<string | null>(null);
  // Doubles as both the preview URL AND the "is this real yet" signal —
  // a blob: URL means a local pick that hasn't been uploaded yet;
  // anything else is either the original real placeholder or (after
  // final submit) a real Cloudinary URL, both safe to submit as-is.
  const [avatarSrc, setAvatarSrc] = useState("");
  // The raw File from the most recent pick, held onto until the final
  // step — we upload once, right before submitting, instead of once per
  // pick. Picking a different photo just swaps this out; nothing hits
  // the network until the user actually finishes.
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [toneTag, setToneTag] = useState("");
  const [bio, setBio] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { status: usernameCheckStatus } = useUsernameAvailability(username);

  // Seed the preview from the real placeholder avatar created at
  // account-creation time, once it's actually loaded.
  useEffect(() => {
    if (user?.avatarSrc) setAvatarSrc(user.avatarSrc);
  }, [user?.avatarSrc]);

  // Already finished onboarding, somehow back on this page (typed the
  // URL, browser back) — nothing left to redo here outside the normal
  // Edit Profile flow, so bounce to Home instead.
  useEffect(() => {
    if (!userLoading && !needsOnboarding) {
      router.replace(PATHS.HOME);
    }
  }, [userLoading, needsOnboarding, router]);

  function handlePhotoSelected(file: File) {
    setAvatarError(null);
    // Swapping to a new pick — drop the previous local preview URL so
    // repeated swaps don't leak blob: URLs, then swap in the new one.
    // Purely local, no network call, no matter how many times the user
    // changes their mind before finishing.
    if (avatarSrc.startsWith("blob:")) URL.revokeObjectURL(avatarSrc);
    setAvatarSrc(URL.createObjectURL(file));
    setAvatarFile(file);
  }

  async function submitAndFinish() {
    setSubmitError(null);

    // Only the LAST photo the user picked ever actually gets uploaded,
    // and only once, right here — not once per pick back in step 2.
    let realAvatarSrc = avatarSrc.startsWith("blob:") ? undefined : avatarSrc;

    if (avatarFile) {
      const result = await uploadAvatar({
        file: avatarFile,
        context: "avatar",
      });

      if (result.success) {
        realAvatarSrc = result.url;
      } else {
        // Bounce back to the photo step so the error sits next to the
        // thing it's about; the picked file is still in state, so
        // hitting Continue again just retries the same upload.
        setAvatarError(result.error);
        setStep(2);
        return;
      }
    }

    const result = await submitOnboarding({
      username,
      avatarSrc: realAvatarSrc,
      toneTag,
      bio,
    });

    if (!result?.success) {
      if (result?.error?.toLowerCase().includes("taken")) {
        setUsernameError(result.error);
        setStep(1);
      } else {
        setSubmitError(
          result?.error || "Something went wrong. Please try again.",
        );
      }
      return;
    }

    router.replace(PATHS.HOME);
  }

  function handleSkip() {
    // "Skip" only skips the OPTIONAL steps (photo, bio/tone tag) — the
    // username chosen in step 1 still gets saved for real. Onboarding is
    // mandatory (see RequireAuth's redirect), so bailing without ever
    // calling the endpoint would just send the person right back here on
    // their very next page load.
    submitAndFinish();
  }

  function handleContinue() {
    if (step === 1) {
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
      setUsernameError(null);
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    submitAndFinish();
  }

  const continueDisabled =
    submitting ||
    avatarUploading ||
    (step === 1 && usernameCheckStatus === "checking");

  return (
    <div className="fixed left-1/2 top-0 bottom-0 z-80 flex w-full max-w-lg -translate-x-1/2 flex-col bg-background px-6">
      <div className="flex items-center justify-between pt-[calc(1.5rem+env(safe-area-inset-top))]">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-1 w-6 rounded-full ${
                i < step ? "bg-foreground" : "bg-foreground/15"
              }`}
            />
          ))}
        </div>
        {/* Skip only appears once past the username step — that one's
            required, photo/bio genuinely aren't. */}
        {step > 1 && (
          <button
            type="button"
            onClick={handleSkip}
            disabled={submitting || avatarUploading}
            className="text-sm font-medium text-foreground/50 disabled:opacity-50"
          >
            Skip
          </button>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-xs">
          {step === 1 && (
            <UsernameStep
              username={username}
              onUsernameChange={(value) => {
                setUsername(value);
                setUsernameError(null);
              }}
              error={usernameError}
              checkStatus={usernameCheckStatus}
            />
          )}
          {step === 2 && (
            <PhotoStep
              avatarSrc={avatarSrc}
              onFileSelected={handlePhotoSelected}
              uploading={avatarUploading}
              error={avatarError}
            />
          )}
          {step === 3 && (
            <AboutStep
              toneTag={toneTag}
              onToneTagChange={setToneTag}
              bio={bio}
              onBioChange={setBio}
            />
          )}
        </div>
      </div>

      {submitError && (
        <p className="mb-2 text-center text-xs text-red-500">{submitError}</p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={continueDisabled}
        className="mb-[calc(1.5rem+env(safe-area-inset-bottom))] w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-60"
      >
        {avatarUploading
          ? "Uploading…"
          : submitting
            ? "Saving…"
            : step === TOTAL_STEPS
              ? "Finish"
              : "Continue"}
      </button>
    </div>
  );
}
