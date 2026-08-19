"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, type CreatePostInput } from "@/services/postService";

// Mirrors useCompleteOnboarding/useUpdateProfile: same
// mutate-then-invalidate pattern. Invalidates the "posts" query (rather
// than doing an optimistic local insert here) so PostsProvider's own
// query — and therefore every consumer reading from usePosts() — picks
// up the new post from a real refetch instead of two sources of truth
// drifting apart.
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => createPost(data),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      }
    },
  });
}
