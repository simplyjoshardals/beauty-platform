"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  XCircleIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { verifyMagicLink } from "@/services/authService";
import { PATHS } from "@/utils/paths";

type Status = "verifying" | "success" | "expired" | "invalid";

// A real UX nicety, not a fake-latency simulation — keeps the "You're
// in!" checkmark on screen just long enough to actually register before
// redirecting, regardless of how fast the real network request resolved.
const REDIRECT_DELAY_MS = 900;

export function VerifyContent({
  token,
  redirectTo,
}: {
  token: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>("verifying");
  const [needsOnboarding, setNeedsOnboarding] = useState(true);

  // Only ever treat this as a same-app relative path — a query param is
  // just a string an attacker could set to anything, so this guards
  // against it ever being used to redirect somewhere off-site.
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : undefined;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const result = await verifyMagicLink(token);
      if (cancelled) return;

      if (!result?.success) {
        // Backend returns error: "expired" | "invalid" (or a generic
        // server-error string on a 500) — anything unrecognized falls
        // back to "invalid" rather than leaving the spinner stuck.
        setStatus(result?.error === "expired" ? "expired" : "invalid");
        return;
      }

      setNeedsOnboarding(Boolean(result.needsOnboarding));
      // The verify response already set fresh session cookies — this
      // just tells useCurrentUser (everywhere it's used, app-wide) to
      // refetch /api/user/me now instead of waiting for its next natural
      // refetch, so isAuthenticated flips to true immediately rather
      // than staying stale until some other trigger (focus, reconnect).
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      setStatus("success");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, queryClient]);

  useEffect(() => {
    if (status !== "success") return;

    // A real, definitive answer from the backend now, not a guess. A
    // brand-new account (no username chosen yet) always goes through
    // onboarding first — even over a remembered redirect, since picking
    // a username isn't optional. A returning user goes straight back to
    // wherever they were gated from, or Home if there's nowhere specific.
    const destination = needsOnboarding
      ? PATHS.ONBOARDING
      : (safeRedirect ?? PATHS.HOME);

    const timer = window.setTimeout(
      () => router.replace(destination),
      REDIRECT_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [status, needsOnboarding, safeRedirect, router]);

  return (
    <div className="fixed left-1/2 top-0 bottom-0 z-80 flex w-full max-w-lg -translate-x-1/2 flex-col items-center justify-center bg-background px-6 text-center">
      <div className="w-full max-w-xs">
        {status === "verifying" && (
          <>
            <SpinnerGapIcon
              size={32}
              className="mx-auto animate-spin text-foreground/50"
            />
            <p className="mt-4 text-sm font-medium">Verifying your link…</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleIcon
              size={36}
              weight="fill"
              className="mx-auto text-green-500"
            />
            <p className="mt-4 text-sm font-medium">
              You&rsquo;re in! Redirecting…
            </p>
          </>
        )}

        {(status === "expired" || status === "invalid") && (
          <>
            <XCircleIcon
              size={36}
              weight="fill"
              className="mx-auto text-red-500"
            />
            <p className="mt-4 text-sm font-medium">
              {status === "expired"
                ? "This link has expired"
                : "This link isn't valid"}
            </p>
            <p className="mt-1 text-sm text-foreground/50">
              {status === "expired"
                ? "Magic links only work for 15 minutes."
                : "Double check you opened the latest email."}
            </p>
            <button
              type="button"
              onClick={() => router.push(PATHS.AUTH)}
              className="mt-5 w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
