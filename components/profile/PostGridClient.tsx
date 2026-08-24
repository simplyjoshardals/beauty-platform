"use client";

import { useUserPosts } from "@/hooks/useUserPosts";
import { PostGrid } from "@/components/profile/PostGrid";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";

type Props = {
  username: string;
};

// On first paint the posts query is already hydrated by PostGridSection
// (the Server Component that renders this), so isLoading is false
// immediately and the skeleton branch below is effectively dead code on
// a fresh page load. It stays as a real fallback for the moment
// isLoading is true, and useUserPosts stays a live query subscription
// (not props) so a later mutation elsewhere — create, delete, like,
// comment, anything that invalidates USER_POSTS_QUERY_KEY_PREFIX — has
// something to refetch into without a full page reload.
export function PostGridClient({ username }: Props) {
  const { posts, isLoading } = useUserPosts(username);

  if (isLoading) {
    return <PostGridSkeleton />;
  }

  return <PostGrid posts={posts} />;
}
