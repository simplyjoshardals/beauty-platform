"use client";

import { useEffect, useState } from "react";
import { usePosts } from "@/context/PostsProvider";
import { useSavedPosts } from "@/context/SavedPostsProvider";
import { getPostThumbnail } from "@/utils/postThumbnail";
import { CollectionTile } from "@/components/saved/CollectionTile";
import { CreateCollectionTile } from "@/components/saved/CreateCollectionTile";
import { CreateCollectionSheet } from "@/components/saved/CreateCollectionSheet";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { RequireAuth } from "@/components/auth/RequireAuth";

// Simulated so the skeleton is actually visible — swap for a real pending
// flag once saved posts/collections come from a real fetch.
const SIMULATED_LOAD_MS = 800;

export default function SavedPage() {
  const { posts } = usePosts();
  const { isSaved, collections, getPostIdsForCollection } = useSavedPosts();
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), SIMULATED_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const allSavedPosts = posts.filter((post) => isSaved(post.id));
  const allSavedCover = allSavedPosts[0]
    ? getPostThumbnail(allSavedPosts[0])
    : undefined;

  return (
    <RequireAuth>
      <div className="flex flex-col">
        <div className="border-b border-foreground/10 px-4 py-3">
          <p className="text-sm font-medium">Saved</p>
        </div>

        {loading ? (
          <PostGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-2 p-3">
            {/* Always present, same as the create tile — it's the default
                collection, not something that only exists once it has posts */}
            <CollectionTile
              id="all"
              name="All Saved"
              coverSrc={allSavedCover}
              count={allSavedPosts.length}
            />

            {collections.map((collection) => {
              const postIds = getPostIdsForCollection(collection.id);
              const collectionPosts = posts.filter((p) =>
                postIds.includes(p.id),
              );
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
    </RequireAuth>
  );
}
