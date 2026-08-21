"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/services/authService";
import type { ProductTag } from "@/types/post";

export type CurrentUser = {
  id: string;
  username: string;
  email: string;
  avatarSrc: string;
  bio: string;
  toneTag: string;
  pinnedRoutine: ProductTag[];
  onboardingCompletedAt: string | null;
  // Real counts off the Follow table now (see app/api/user/me/route.ts),
  // same _count pattern GET /api/user/[username] already used for
  // someone else's profile — not the CURRENT_USER_PROFILE mock /
  // FollowProvider's local state this used to read.
  followerCount: number;
  followingCount: number;
};

// Replaces AuthProvider's isAuthenticated boolean entirely. Session
// state now comes from actually asking the backend "who am I" via the
// existing session cookies, not a client-only flag that got set once by
// VerifyContent and then forgotten. This is what fixes the old gap where
// refreshing the page dropped you back to "logged out" even with valid
// cookies still present — useQuery refetches on mount automatically.
export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const result = await getCurrentUser();
      if (!result?.success) return null;
      return result.user as CurrentUser;
    },
  });

  const user = query.data ?? null;

  return {
    user,
    isAuthenticated: Boolean(user),
    // Only meaningful once actually authenticated — a logged-out visitor
    // isn't "needing onboarding," they're just logged out, which
    // RequireAuth already handles as a separate, earlier check.
    needsOnboarding: Boolean(user) && user?.onboardingCompletedAt == null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
