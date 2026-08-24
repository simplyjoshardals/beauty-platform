import { cache } from "react";
import { prisma } from "./prisma";
import { postInclude, serializePost, getPostsByUsername } from "./posts";
import { buildSavedBundle } from "./saved";
import {
  getFullCurrentUser,
  getFollowingList,
  getPublicUserProfile,
  getPublicUserProfilesBatch,
} from "./users";
import { getLikedPostIds } from "./likes";

const FEED_TAKE = 50; // keep in sync with app/api/posts/route.ts

export async function fetchPostsForSSR() {
  const posts = await prisma.post.findMany({
    include: postInclude,
    orderBy: { createdAt: "desc" },
    take: FEED_TAKE,
  });
  return posts.map(serializePost);
}

// Backs the post grid on both /profile and /u/[username] — same query
// GET /api/user/[username]/posts runs (getPostsByUsername, in
// lib/posts.ts), called directly instead of over HTTP. Called from
// inside PostGridSection (components/profile/PostGridSection.tsx),
// which both pages render behind a <Suspense> boundary — this is
// deliberately the slow, heavier query (media, carousel items,
// products, per-post like/comment counts), kept separate from the cheap
// profile lookup above so the header can render and stream to the
// client without waiting on this to resolve. Takes a username rather
// than a userId: the caller (PostGridSection) doesn't necessarily have
// a userId on hand without its own extra lookup, and getPostsByUsername
// resolving one internally is cheap next to the query it's paired with
// here anyway.
export async function fetchUserPostsForSSR(username: string) {
  return getPostsByUsername(username);
}

// Backs /u/[username]'s header — same lookup GET /api/user/[username]
// runs (including the viewer-relative isFollowing/followsMe, and a real
// postCount via _count — see lib/users.ts), called directly and awaited
// before anything is flushed to the client, so the header renders with
// real data (including the post count) on first paint, and a
// nonexistent username 404s server-side instead of after mount.
export async function fetchUserProfileForSSR(
  username: string,
  viewerId: string | null,
) {
  return getPublicUserProfile(username, viewerId);
}

export async function fetchLikedPostIdsForSSR(userId: string) {
  return getLikedPostIds(userId);
}

export async function fetchSavedBundleForSSR(userId: string) {
  const [savedPosts, collections] = await Promise.all([
    prisma.savedPost.findMany({
      where: { userId },
      select: {
        postId: true,
        collections: { select: { collectionId: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.collection.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return buildSavedBundle(savedPosts, collections);
}

export async function fetchFollowingForSSR(username: string) {
  return (await getFollowingList(username)) ?? [];
}

export async function fetchUserProfilesBatchForSSR(
  usernames: string[],
  viewerId: string,
) {
  return getPublicUserProfilesBatch(usernames, viewerId);
}

// Wrapped in React's cache() so calling this from both the root layout
// (for the global currentUser hydration BottomNav etc. need on every
// route) and a page (for its own SSR prefetches) within the same
// request only hits the DB once — React dedupes by arguments for the
// lifetime of a single render pass.
export const fetchCurrentUserForSSR = cache(async (userId: string) => {
  return getFullCurrentUser(userId);
});
