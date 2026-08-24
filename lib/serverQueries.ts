import { cache } from "react";
import { prisma } from "./prisma";
import { postInclude, serializePost } from "./posts";
import { buildSavedBundle } from "./saved";
import {
  getFullCurrentUser,
  getFollowingList,
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
