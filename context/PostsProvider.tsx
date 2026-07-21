"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Post } from "@/types/post";
import { mockPosts as initialPosts } from "@/data/mockPosts";

type PostsContextValue = {
  posts: Post[];
  addPost: (post: Post) => void;
  deletePost: (postId: string) => void;
};

const PostsContext = createContext<PostsContextValue | null>(null);

// In-memory only — resets on refresh. This is the seam to swap for a real
// fetch/mutation once there's an actual API; HomeFeed and the create-post
// flow both go through this instead of touching mockPosts directly, so
// neither has to change when that swap happens.
export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  function addPost(post: Post) {
    setPosts((prev) => [post, ...prev]);
  }

  function deletePost(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  return (
    <PostsContext.Provider value={{ posts, addPost, deletePost }}>
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
