"use client";

import { useRouter, usePathname } from "next/navigation";
import { XIcon } from "@phosphor-icons/react";
import { PATHS } from "@/utils/paths";

type Props = {
  open: boolean;
  message?: string;
  // false for full-page gates — there's no content behind the modal to
  // dismiss back to, so closing it wouldn't make sense. true for
  // action-level gates on public pages, where the underlying content is
  // still fully visible/usable and "never mind" is a real option.
  dismissible?: boolean;
  onClose?: () => void;
};

export function AuthGateModal({
  open,
  message = "Sign in to continue using Vanity.",
  dismissible = true,
  onClose,
}: Props) {
  const router = useRouter();
  // Reads its OWN current page — this modal is always rendered on
  // whatever page triggered it, so there's nothing to thread through as
  // a prop. After a successful sign-in, /auth/verify redirects back here
  // instead of the default onboarding flow.
  const pathname = usePathname();

  if (!open) return null;

  function handleSignIn() {
    const signInUrl = `${PATHS.AUTH}?redirect=${encodeURIComponent(pathname)}`;
    router.push(signInUrl);
  }

  return (
    <div className="fixed inset-0 z-95 flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={dismissible ? onClose : undefined}
        aria-hidden
      />

      <div className="relative w-full max-w-xs rounded-2xl bg-background p-6 text-center shadow-xl">
        {dismissible && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 text-foreground/40"
          >
            <XIcon size={18} />
          </button>
        )}

        <p className="text-sm font-medium">Sign in to continue</p>
        <p className="mt-1.5 text-sm text-foreground/60">{message}</p>

        <button
          type="button"
          onClick={handleSignIn}
          className="mt-5 w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
