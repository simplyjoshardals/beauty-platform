"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, type UpdateProfileInput } from "@/services/userService";

// Mirrors useCompleteOnboarding: same endpoint family, same
// invalidate-currentUser-on-success pattern, so every consumer of
// useCurrentUser() (BottomNav's avatar, PostCard/CreatePostForm's
// author snapshot, the profile page itself) picks up the edit
// immediately instead of acting on stale cached data.
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateProfile(data),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      }
    },
  });
}
