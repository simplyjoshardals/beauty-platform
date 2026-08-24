"use client";

import { useState } from "react";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { getPostThumbnail } from "@/utils/postThumbnail";
import { CollectionTile } from "@/components/saved/CollectionTile";
import { CreateCollectionTile } from "@/components/saved/CreateCollectionTile";
import { CreateCollectionSheet } from "@/components/saved/CreateCollectionSheet";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";

// Extracted from app/saved/page.tsx as part of moving that page to SSR
// (mirrors app/(home)/page.tsx and app/profile/page.tsx's split: an
// async Server Component does the prefetch, a "use client" component
// underneath just reads the now-hydrated cache).
//
// `posts` now comes straight from useSavedPosts — a dedicated query
// (GET /api/saved → lib/saved.ts's getSavedBundle) that returns the
// actual saved posts, queried off the SavedPost join. This used to be
// usePosts()'s full home-feed list filtered down with isSaved(post.id)
// — every post here is saved by definition now, so there's nothing
// left to filter, and a saved post from someone you don't follow (who
// therefore never appeared in the home feed) shows up correctly.
export function SavedGridContent() {
  const { posts, collections, getPostIdsForCollection, isLoading } =
    useSavedPosts();
  const [createOpen, setCreateOpen] = useState(false);

  const allSavedCover = posts[0] ? getPostThumbnail(posts[0]) : undefined;

  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground/10 px-4 py-3">
        <p className="text-sm font-medium">Saved</p>
      </div>

      {isLoading ? (
        <PostGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-2 p-3">
          {/* Always present, same as the create tile — it's the default
              collection, not something that only exists once it has posts */}
          <CollectionTile
            id="all"
            name="All Saved"
            coverSrc={allSavedCover}
            count={posts.length}
          />

          {collections.map((collection) => {
            const postIds = getPostIdsForCollection(collection.id);
            const collectionPosts = posts.filter((p) => postIds.includes(p.id));
            const cover = collectionPosts[0]
              ? getPostThumbnail(collectionPosts[0])
              : undefined;
            return (
              <CollectionTile
                key={collection.id}
                id={collection.id}
                name={collection.name}
                coverSrc={cover}
                count={collectionPosts.length}
              />
            );
          })}

          {/* Always present, even with nothing saved yet — creating a
              collection shouldn't require saving something first */}
          <CreateCollectionTile onPress={() => setCreateOpen(true)} />
        </div>
      )}

      <CreateCollectionSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
