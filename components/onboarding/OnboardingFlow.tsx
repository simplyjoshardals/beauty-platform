"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileProvider";
import { PATHS } from "@/utils/paths";
import { validateUsername } from "@/utils/username";
import { UsernameStep } from "./UsernameStep";
import { PhotoStep } from "./PhotoStep";
import { AboutStep } from "./AboutStep";

const TOTAL_STEPS = 3;

export function OnboardingFlow() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState(profile.username);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState(profile.avatarSrc);
  const [toneTag, setToneTag] = useState(profile.toneTag);
  const [bio, setBio] = useState(profile.bio);

  function goToHome() {
    router.replace(PATHS.HOME);
  }

  function handleContinue() {
    if (step === 1) {
      // Unlike photo/bio, a username genuinely isn't optional — this is
      // the one step "Continue" actually blocks on.
      const error = validateUsername(username, profile.username);
      if (error) {
        setUsernameError(error);
        return;
      }
      updateProfile({ username: username.trim().toLowerCase() });
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    // Final step — save whatever was filled in (including an unchanged
    // default avatar, if photo was skipped) and land on Home.
    updateProfile({ avatarSrc, toneTag, bio });
    goToHome();
  }

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
            onClick={goToHome}
            className="text-sm font-medium text-foreground/50"
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
            />
          )}
          {step === 2 && (
            <PhotoStep avatarSrc={avatarSrc} onAvatarChange={setAvatarSrc} />
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

      <button
        type="button"
        onClick={handleContinue}
        className="mb-[calc(1.5rem+env(safe-area-inset-bottom))] w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background"
      >
        {step === TOTAL_STEPS ? "Finish" : "Continue"}
      </button>
    </div>
  );
}
