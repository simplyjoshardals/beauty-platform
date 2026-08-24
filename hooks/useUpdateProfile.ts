"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, type UpdateProfileInput } from "@/services/userService";
import { POSTS_QUERY_KEY, USER_POSTS_QUERY_KEY_PREFIX } from "@/lib/queryKeys";

// Mirrors useCompleteOnboarding: same endpoint family, same
// invalidate-currentUser-on-success pattern, so every consumer of
// useCurrentUser() (BottomNav's avatar, PostCard/CreatePostForm's
// author snapshot, the profile page itself) picks up the edit
// immediately instead of acting on stale cached data.
//
// currentUser isn't the only thing that goes stale, though: every Post
// carries its own embedded author snapshot (username/avatarSrc/toneTag,
// see types/post.ts) rather than reading it live off the author's user
// row, and that snapshot lives in POSTS_QUERY_KEY (home feed) and every
// USER_POSTS_QUERY_KEY(username) (profile grids) — neither of which
// currentUser invalidating touches. Without these, a username/avatar/
// tone tag edit updates the header instantly but every already-mounted
// PostCard for your own posts keeps rendering the old snapshot until
// something else happens to refetch it. Invalidating by prefix for
// userPosts hits every cached username at once, which is broader than
// strictly necessary but avoids having to know your OLD username here.
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateProfile(data),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
        queryClient.invalidateQueries({
          queryKey: USER_POSTS_QUERY_KEY_PREFIX,
        });
      }
    },
  });
}
