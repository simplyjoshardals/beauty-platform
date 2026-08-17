"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PATHS } from "@/utils/paths";
import { AuthGateModal } from "./AuthGateModal";

type Props = {
  children: ReactNode;
  message?: string;
};

// Wraps an entire page that requires a real session — Home, Explore,
// Saved, Notifications, your own Profile, Create, Onboarding, etc.
// Nothing to browse read-only behind the modal here (unlike the
// action-level gates on /p/[postId] and /u/[username]), so it's
// non-dismissible: signing in is the only way forward.
//
// Also handles the "logged in but hasn't finished onboarding yet" case —
// any page other than /onboarding itself redirects there first. The
// onboarding page is naturally exempt from this without needing a
// special prop: pathname === PATHS.ONBOARDING is exactly the condition
// that skips the redirect below.
export function RequireAuth({ children, message }: Props) { 
  const { isAuthenticated, needsOnboarding, isLoading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  const shouldRedirectToOnboarding =
    isAuthenticated && needsOnboarding && pathname !== PATHS.ONBOARDING;

  useEffect(() => {
    if (shouldRedirectToOnboarding) {
      router.replace(PATHS.ONBOARDING);
    }
  }, [shouldRedirectToOnboarding, router]);

  // isAuthenticated starts false before the session check resolves, not
  // just when someone's genuinely logged out — without this check, an
  // actually-logged-in person would see the sign-in gate flash briefly on
  // every full page load, before the real /api/user/me result comes back.
  if (isLoading) return null;

  if (!isAuthenticated) {
    return <AuthGateModal open dismissible={false} message={message} />;
  }

  if (shouldRedirectToOnboarding) {
    // The redirect effect above will fire; render nothing in the
    // meantime rather than flashing the real page content first.
    return null;
  }

  return <>{children}</>;
}
