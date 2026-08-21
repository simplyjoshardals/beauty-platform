"use client";

import { usePosts } from "@/hooks/usePosts";
import { useFollowingList } from "@/hooks/useFollowingList";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PostCard } from "./PostCard";
import { HomeFeedSkeleton } from "./HomeFeedSkeleton";
import { EmptyHomeFeed } from "./EmptyHomeFeed";

// Real following list now (see hooks/useFollowingList.ts), not
// context/FollowProvider's mock Set — this is the query key
// useUserProfile's toggleFollow already optimistically patches when
// following someone from a post card, so a fresh follow from inside the
// feed itself shows up here without a manual refetch.
export function HomeFeed() {
  const { posts, isLoading: postsLoading } = usePosts();
  const { user } = useCurrentUser();
  const { users: following, isLoading: followingLoading } = useFollowingList(
    user?.username,
  );

  // Both requests are independent (different endpoints, no shared
  // loading state), so the skeleton waits on whichever finishes last
  // rather than assuming one always resolves before the other.
  if (postsLoading || followingLoading) {
    return <HomeFeedSkeleton />;
  }

  const followingUsernames = new Set(following.map((u) => u.username));

  // Your own posts always show here too, same as before — Home isn't
  // "everyone I follow, minus me."
  const followingFeed = posts.filter(
    (post) =>
      post.author.id === user?.id ||
      followingUsernames.has(post.author.username),
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
