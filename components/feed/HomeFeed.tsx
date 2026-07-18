"use client";

import { usePosts } from "@/context/PostsProvider";
import { useFollow } from "@/context/FollowProvider";
import { CURRENT_USER } from "@/constants/currentUser";
import { PostCard } from "./PostCard";

export function HomeFeed() {
  const { posts } = usePosts();
  const { isFollowing } = useFollow();

  const followingFeed = posts.filter(
    (post) =>
      post.author.username === CURRENT_USER.username ||
      isFollowing(post.author.username),
  );

  return (
    <div className="flex flex-col">
      {followingFeed.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
