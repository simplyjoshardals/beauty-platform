"use client";

import { usePosts } from "@/context/PostsProvider";
import { PostCard } from "./PostCard";

export function HomeFeed() {
  const { posts } = usePosts();

  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
