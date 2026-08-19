"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/types/post";
import { listPosts } from "@/services/postService";

const POSTS_QUERY_KEY = ["posts"] as const;

// Replaces context/PostsProvider.tsx. Same query key, same shape — react-
// query already dedupes/shares the cache across every component that
// calls this, so HomeFeed and PostCard both calling usePosts() does NOT
// mean two separate fetches. No provider wrapping needed, which also
// means this only ever runs on pages that actually render one of those
// two components — not on every page in the app (that was what caused
// the /auth refresh-token 401 loop: PostsProvider used to sit in
// app/layout.tsx, so it fired on /auth too, on every logged-out load).
export function usePosts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: POSTS_QUERY_KEY,
    queryFn: async () => {
      const result = await listPosts();
      if (!result?.success) return [];
      return result.posts;
    },
  });

  const posts = query.data ?? [];

  // No-op passthrough — real creation goes through useCreatePost, which
  // already invalidates POSTS_QUERY_KEY on success and lets that refetch
  // put the new post into `posts`, instead of trusting a client-built
  // object as the source of truth.
  function addPost(_post: Post) {}

  // No DELETE /api/posts endpoint yet — this stays a local, client-side-
  // only removal from the cached list (not persisted, reverts on the
  // next real refetch). Matches PostsProvider's old behavior exactly.
  function deletePost(postId: string) {
    queryClient.setQueryData<Post[]>(POSTS_QUERY_KEY, (prev) =>
      (prev ?? []).filter((p) => p.id !== postId),
    );
  }

  return { posts, isLoading: query.isLoading, addPost, deletePost };
}
