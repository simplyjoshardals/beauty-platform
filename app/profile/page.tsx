"use client";

import { useEffect, useState } from "react";
import { usePosts } from "@/context/PostsProvider";
import { useFollow } from "@/context/FollowProvider";
import { useProfile } from "@/context/ProfileProvider";
import { CURRENT_USER } from "@/constants/currentUser";
import { CURRENT_USER_PROFILE } from "@/data/currentUserProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileHeaderSkeleton } from "@/components/profile/ProfileHeaderSkeleton";
import { PostGrid } from "@/components/profile/PostGrid";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { ProductChips } from "@/components/feed/ProductChips";

// Simulated so the skeleton is actually visible — swap for a real pending
// flag once profile data comes from a fetch instead of context.
const SIMULATED_LOAD_MS = 900;

export default function ProfilePage() {
  const { posts } = usePosts();
  const { followingCount } = useFollow();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), SIMULATED_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const myPosts = posts.filter(
    (post) => post.author.username === CURRENT_USER.username,
  );

  if (loading) {
    return (
      <div className="flex flex-col">
        <ProfileHeaderSkeleton />
        <div className="animate-pulse border-t border-foreground/10 px-4 py-4">
          <div className="mb-2 h-3.5 w-16 rounded bg-foreground/10" />
          <div className="flex gap-2">
            <div className="h-7 w-28 shrink-0 rounded-full bg-foreground/10" />
            <div className="h-7 w-24 shrink-0 rounded-full bg-foreground/10" />
          </div>
        </div>
        <div className="border-t border-foreground/10">
          <PostGridSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ProfileHeader
        isOwnProfile
        username={CURRENT_USER.username}
        avatarSrc={profile.avatarSrc}
        bio={profile.bio}
        toneTag={profile.toneTag}
        postCount={myPosts.length}
        followerCount={CURRENT_USER_PROFILE.followerCount}
        followingCount={followingCount}
      />

      {profile.pinnedRoutine.length > 0 && (
        <div className="border-t border-foreground/10 px-4 py-4">
          <p className="mb-2 text-sm font-medium">Routine</p>
          <ProductChips products={profile.pinnedRoutine} />
        </div>
      )}

      <div className="border-t border-foreground/10">
        <PostGrid posts={myPosts} />
      </div>
    </div>
  );
}
