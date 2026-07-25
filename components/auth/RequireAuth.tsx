"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthProvider";
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
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthGateModal open dismissible={false} message={message} />;
  }

  return <>{children}</>;
}