"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  completeOnboarding,
  type CompleteOnboardingInput,
} from "@/services/userService";

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompleteOnboardingInput) => completeOnboarding(data),
    onSuccess: (result) => {
      if (result?.success) {
        // Username/bio/tone tag (and onboarding status) just changed —
        // refetch so every useCurrentUser() consumer app-wide (BottomNav's
        // avatar gating, RequireAuth's onboarding redirect, etc.) reflects
        // it immediately instead of acting on stale cached data.
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      }
    },
  });
}
