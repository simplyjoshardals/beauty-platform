import { prisma } from "./prisma";
import { serializePost, postInclude } from "./posts";
import type { Post } from "@/types/post";

export const MAX_COLLECTION_NAME_LENGTH = 60;

export type SavedBundle = {
  posts: Post[];
  savedPostIds: string[];
  collections: { id: string; name: string; postIds: string[] }[];
};

// Single source of truth for "this user's saved posts" — GET /api/saved
// (the client-side fetch getSavedBundle makes) and
// lib/serverQueries.ts's fetchSavedBundleForSSR both call this instead
// of each running their own copy of the same Prisma query, same
// convention as getHomeFeedPosts/getPostsByUserId in lib/posts.ts.
//
// Queried from the SavedPost side (not Post's `savedPosts` relation),
// so `orderBy: { createdAt: "desc" }` sorts by when a post was SAVED,
// not when it was originally posted — a post you saved yesterday but
// that's a year old still shows up first, same order the old
// savedPostIds-only version returned.
//
// Returns full Post objects, not just ids. The previous version of
// this only returned savedPostIds + collections, and the frontend
// cross-referenced those ids against the home feed's post list (your
// own posts + who you follow, via usePosts) to figure out which actual
// posts to render. That meant a saved post from someone you don't
// follow was never in that list to begin with — it couldn't render on
// /saved at all, silently. This queries the actual saved posts
// directly, the same way getPostsByUserId queries a profile's actual
// posts instead of filtering the feed down to one author.
export async function getSavedBundle(userId: string): Promise<SavedBundle> {
  const [savedPosts, collections] = await Promise.all([
    prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: { include: postInclude },
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

  const postIdsByCollection = new Map<string, string[]>();
  for (const saved of savedPosts) {
    for (const { collectionId } of saved.collections) {
      const list = postIdsByCollection.get(collectionId);
      if (list) {
        list.push(saved.postId);
      } else {
        postIdsByCollection.set(collectionId, [saved.postId]);
      }
    }
  }

  return {
    posts: savedPosts.map((s) => serializePost(s.post)),
    savedPostIds: savedPosts.map((s) => s.postId),
    collections: collections.map((c) => ({
      id: c.id,
      name: c.name,
      postIds: postIdsByCollection.get(c.id) ?? [],
    })),
  };
}
