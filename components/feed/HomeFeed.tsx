"use client";

import { usePosts } from "@/hooks/usePosts";
import { useFollow } from "@/context/FollowProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PostCard } from "./PostCard";
import { HomeFeedSkeleton } from "./HomeFeedSkeleton";
import { EmptyHomeFeed } from "./EmptyHomeFeed";

export function HomeFeed() {
  const { posts, isLoading } = usePosts();
  const { isFollowing } = useFollow();
  const { user } = useCurrentUser();

  if (isLoading) {
    return <HomeFeedSkeleton />;
  }

  const followingFeed = posts.filter(
    (post) => post.author.id === user?.id || isFollowing(post.author.username),
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
