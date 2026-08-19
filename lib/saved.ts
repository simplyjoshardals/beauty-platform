export const MAX_COLLECTION_NAME_LENGTH = 60;

// Shape this file needs from Prisma's SavedPost rows — hand-rolled, same
// convention as lib/posts.ts's PostRecord, so this has no compile-time
// dependency on the generated client.
export type SavedPostRecord = {
  postId: string;
  collections: { collectionId: string }[];
};

export type CollectionRecord = {
  id: string;
  name: string;
};

// The bundle GET /api/saved returns: every saved post id, plus every
// collection with the post ids it contains. This is the exact shape the
// old SavedPostsProvider kept in memory — the frontend hook derives
// isSaved/isPostInCollection/getPostIdsForCollection from it the same
// way the provider's closures used to, just backed by a real fetch
// instead of useState.
export function buildSavedBundle(
  savedPosts: SavedPostRecord[],
  collections: CollectionRecord[],
) {
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
    savedPostIds: savedPosts.map((s) => s.postId),
    collections: collections.map((c) => ({
      id: c.id,
      name: c.name,
      postIds: postIdsByCollection.get(c.id) ?? [],
    })),
  };
}
