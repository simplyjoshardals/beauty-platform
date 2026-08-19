"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/types/post";
import { listPosts } from "@/services/postService";

type PostsContextValue = {
  posts: Post[];
  isLoading: boolean;
  // Kept for existing consumers (CreatePostForm, PostCard) so neither
  // needs an unnecessary rewrite. addPost is a no-op passthrough now —
  // real creation goes through useCreatePost, which invalidates the
  // "posts" query itself and lets this refetch from the server instead
  // of trusting a client-built object as if it were the source of truth.
  addPost: (post: Post) => void;
  // No DELETE /api/posts endpoint exists yet — this stays a local,
  // client-side-only removal from the cached list (not persisted, and
  // reverts on the next real refetch). Good enough for the current
  // PostOptionsSheet flow without inventing a new backend endpoint that
  // wasn't part of this task.
  deletePost: (postId: string) => void;
};

const PostsContext = createContext<PostsContextValue | null>(null);

const POSTS_QUERY_KEY = ["posts"] as const;

export function PostsProvider({ children }: { children: ReactNode }) {
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

  function addPost() {
    // Real creation now goes through useCreatePost (services/postService
    // -> app/api/posts), which already invalidates ["posts"] on success —
    // that refetch is what actually gets the new post into `posts`. This
    // is left as a no-op purely so the context shape doesn't change out
    // from under existing callers.
  }

  function deletePost(postId: string) {
    queryClient.setQueryData<Post[]>(POSTS_QUERY_KEY, (prev) =>
      (prev ?? []).filter((p) => p.id !== postId),
    );
  }

  return (
    <PostsContext.Provider
      value={{ posts, isLoading: query.isLoading, addPost, deletePost }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return ctx;
}