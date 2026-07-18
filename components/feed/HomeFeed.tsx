"use client";

import { useEffect, useState } from "react";
import { usePosts } from "@/context/PostsProvider";
import { useFollow } from "@/context/FollowProvider";
import { CURRENT_USER } from "@/constants/currentUser";
import { PostCard } from "./PostCard";
import { HomeFeedSkeleton } from "./HomeFeedSkeleton";
import { EmptyHomeFeed } from "./EmptyHomeFeed";

// Purely so the skeleton is actually visible for you to look at right now —
// delete this whole loading simulation once posts come from a real fetch
// with its own real pending state.
const SIMULATED_LOAD_MS = 1200;

export function HomeFeed() {
  const { posts } = usePosts();
  const { isFollowing } = useFollow();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), SIMULATED_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading) {
    return <HomeFeedSkeleton />;
  }

  const followingFeed = posts.filter(
    (post) =>
      post.author.username === CURRENT_USER.username ||
      isFollowing(post.author.username),
  );

  if (followingFeed.length === 0) {
    return <EmptyHomeFeed />;
  }

  return (
    <div className="flex flex-col">
      {followingFeed.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
