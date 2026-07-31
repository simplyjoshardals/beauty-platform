"use client";

import { useEffect, useState } from "react";
import { EnvelopeSimpleOpenIcon } from "@phosphor-icons/react";
import { requestMagicLink } from "@/services/authService";

const RESEND_COOLDOWN_SECONDS = 30;

export function CheckEmailScreen({
  email,
  onUseDifferentEmail,
  redirectTo,
}: {
  email: string;
  onUseDifferentEmail: () => void;
  redirectTo?: string;
}) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0) return;
    setResendError(null);

    const result = await requestMagicLink(email, redirectTo);

    if (!result?.success) {
      // Most likely the backend's own cooldown (429) firing in some edge
      // case where the two timers drifted — surfaced rather than
      // silently doing nothing.
      setResendError(result?.error || "Couldn't resend. Try again shortly.");
      return;
    }

    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  return (
    <div className="w-full max-w-xs text-center">
      <div className="mb-5 flex justify-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-foreground/5">
          <EnvelopeSimpleOpenIcon size={30} className="text-foreground/60" />
        </div>
      </div>

      <h1 className="text-lg font-semibold">Check your email</h1>
      <p className="mt-2 text-sm text-foreground/60">
        We sent a sign-in link to
      </p>
      <p className="text-sm font-medium">{email}</p>
      <p className="mt-3 text-xs text-foreground/40">
        The link expires in 15 minutes. You can close this tab.
      </p>

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0}
        className="mt-6 w-full rounded-lg border border-foreground/15 py-2.5 text-sm font-medium disabled:opacity-40"
      >
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
      </button>
      {resendError && (
        <p className="mt-2 text-xs text-red-500">{resendError}</p>
      )}

      <button
        type="button"
        onClick={onUseDifferentEmail}
        className="mt-3 text-sm font-medium text-foreground/60"
      >
        Use a different email
      </button>
    </div>
  );
}
