"use client";

import type { ReactNode } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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
export function RequireAuth({ children, message }: Props) {
  const { isAuthenticated, isLoading } = useCurrentUser();

  // isAuthenticated starts false before the session check resolves, not
  // just when someone's genuinely logged out — without this check, an
  // actually-logged-in person would see the sign-in gate flash briefly on
  // every full page load, before the real /api/user/me result comes back.
  if (isLoading) return null;

  if (!isAuthenticated) {
    return <AuthGateModal open dismissible={false} message={message} />;
  }

  return <>{children}</>;
}
