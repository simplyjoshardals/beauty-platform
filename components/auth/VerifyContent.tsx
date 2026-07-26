"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  XCircleIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthProvider";
import { PATHS } from "@/utils/paths";

type Status = "verifying" | "success" | "expired" | "invalid";

// Simulated network delay before "validating" — stands in for a real
// backend round trip. See AuthProvider.verifyToken for what makes a token
// "expired" vs "invalid" vs valid in this simulation.
const VERIFY_DELAY_MS = 1200;
const REDIRECT_DELAY_MS = 900;

export function VerifyContent({
  token,
  redirectTo,
}: {
  token: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { verifyToken } = useAuth();
  const [status, setStatus] = useState<Status>("verifying");

  // Only ever treat this as a same-app relative path — a query param is
  // just a string an attacker could set to anything, so this guards
  // against it ever being used to redirect somewhere off-site.
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : undefined;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!token) {
        setStatus("invalid");
        return;
      }
      const result = verifyToken(token);
      setStatus(result);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, VERIFY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [token]);

  useEffect(() => {
    if (status !== "success") return;
    // Someone who got sent here from a specific gated page/action goes
    // straight back to it — onboarding is only for a "fresh" sign-in with
    // no particular origin, not for someone just trying to finish what
    // they were already doing.
    const destination = safeRedirect ?? PATHS.ONBOARDING;
    const timer = window.setTimeout(
      () => router.replace(destination),
      REDIRECT_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

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
