"use client";

import { usePosts } from "@/context/PostsProvider";
import { useFollow } from "@/context/FollowProvider";
import { useProfile } from "@/context/ProfileProvider";
import { CURRENT_USER } from "@/constants/currentUser";
import { CURRENT_USER_PROFILE } from "@/data/currentUserProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostGrid } from "@/components/profile/PostGrid";
import { ProductChips } from "@/components/feed/ProductChips";

export default function ProfilePage() {
  const { posts } = usePosts();
  const { followingCount } = useFollow();
  const { profile } = useProfile();

  const myPosts = posts.filter(
    (post) => post.author.username === CURRENT_USER.username,
  );

  return (
    <div className="flex flex-col">
      <ProfileHeader
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
