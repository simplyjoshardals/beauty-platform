"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeSimpleOpenIcon } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthProvider";
import { PATHS } from "@/utils/paths";

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
  const router = useRouter();
  const { requestMagicLink } = useAuth();
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  // Carries the "where to return to" info through the one path that
  // actually mimics clicking the real email link in this simulation.
  const redirectQuery = redirectTo
    ? `?redirect=${encodeURIComponent(redirectTo)}`
    : "";

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function handleResend() {
    if (cooldown > 0) return;
    requestMagicLink(email);
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

      <button
        type="button"
        onClick={onUseDifferentEmail}
        className="mt-3 text-sm font-medium text-foreground/60"
      >
        Use a different email
      </button>

      {/* Simulation-only — there's no real backend or email being sent, so
          this is how the flow actually gets exercised in this demo. Remove
          once real magic-link delivery + /auth/verify validation exist. */}
      <div className="mt-8 border-t border-foreground/10 pt-4">
        <p className="mb-2 text-[11px] uppercase tracking-wide text-foreground/30">
          Demo only
        </p>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() =>
              router.push(
                `${PATHS.AUTH_VERIFY("demo-valid-token")}${redirectQuery}`,
              )
            }
            className="text-xs font-medium text-foreground/50 underline"
          >
            Simulate clicking the email link
          </button>
          <button
            type="button"
            onClick={() =>
              router.push(`${PATHS.AUTH_VERIFY("expired")}${redirectQuery}`)
            }
            className="text-xs font-medium text-foreground/50 underline"
          >
            Simulate an expired link
          </button>
        </div>
      </div>
    </div>
  );
}
