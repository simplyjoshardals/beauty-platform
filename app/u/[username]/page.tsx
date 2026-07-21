"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { usePosts } from "@/context/PostsProvider";
import { useFollow } from "@/context/FollowProvider";
import { CURRENT_USER } from "@/constants/currentUser";
import { getMockUser } from "@/data/mockUsers";
import { isMockFollowerOfCurrentUser } from "@/data/mockFollowers";
import { PATHS } from "@/utils/paths";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileHeaderSkeleton } from "@/components/profile/ProfileHeaderSkeleton";
import { PostGrid } from "@/components/profile/PostGrid";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { ProductChips } from "@/components/feed/ProductChips";

type Props = {
  params: Promise<{ username: string }>;
};

const SIMULATED_LOAD_MS = 900;

export default function UserProfilePage({ params }: Props) {
  const { username } = use(params);
  const router = useRouter();
  const { posts } = usePosts();
  const { isFollowing, toggleFollow } = useFollow();
  const [loading, setLoading] = useState(true);

  // This route is for viewing OTHER people. Your own profile — with Edit
  // Profile instead of a Follow button — lives at /profile. Redirect
  // rather than rendering a nonsensical "follow yourself" state.
  const isSelf = username === CURRENT_USER.username;

  useEffect(() => {
    if (isSelf) {
      router.replace(PATHS.PROFILE);
    }
  }, [isSelf, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), SIMULATED_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (isSelf) {
    return null;
  }

  const user = getMockUser(username);

  // No fabricated fallback profile — if this username isn't real, say so,
  // don't render a full profile with a working Follow button for nobody.
  if (!user) {
    notFound();
  }

  const userPosts = posts.filter((post) => post.author.username === username);

  if (loading) {
    return (
      <div className="flex flex-col">
        <ProfileHeaderSkeleton />
        <div className="border-t border-foreground/10">
          <PostGridSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ProfileHeader
        isOwnProfile={false}
        username={user.username}
        avatarSrc={user.avatarSrc}
        bio={user.bio}
        toneTag={user.toneTag}
        postCount={userPosts.length}
        followerCount={user.followerCount ?? 0}
        followingCount={user.followingCount ?? 0}
        isFollowing={isFollowing(user.username)}
        followsMe={isMockFollowerOfCurrentUser(user.username)}
        onToggleFollow={() => toggleFollow(user.username)}
      />

      {user.pinnedRoutine && user.pinnedRoutine.length > 0 && (
        <div className="border-t border-foreground/10 px-4 py-4">
          <p className="mb-2 text-sm font-medium">Routine</p>
          <ProductChips products={user.pinnedRoutine} />
        </div>
      )}

      <div className="border-t border-foreground/10">
        <PostGrid posts={userPosts} />
      </div>
    </div>
  );
}
