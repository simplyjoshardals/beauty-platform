"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { DotsThreeIcon } from "@phosphor-icons/react";
import { usePosts } from "@/hooks/usePosts";
import { useSavedPosts } from "@/context/SavedPostsProvider";
import { PostGrid } from "@/components/profile/PostGrid";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { CollectionOptionsSheet } from "@/components/saved/CollectionOptionsSheet";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PATHS } from "@/utils/paths";
import { RequireAuth } from "@/components/auth/RequireAuth";

type Props = {
  params: Promise<{ collectionId: string }>;
};

const SIMULATED_LOAD_MS = 700;

export default function SavedCollectionPage({ params }: Props) {
  const { collectionId } = use(params);
  const router = useRouter();
  const { posts } = usePosts();
  const {
    isSaved,
    toggleSave,
    collections,
    getPostIdsForCollection,
    toggleCollectionForPost,
  } = useSavedPosts();
  const [loading, setLoading] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [pendingRemovePostId, setPendingRemovePostId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), SIMULATED_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const isAll = collectionId === "all";
  const collection = collections.find((c) => c.id === collectionId);

  // "all" is always valid (it's the built-in view) — anything else must
  // match a real collection, or this is a bad/stale link.
  if (!isAll && !collection) {
    notFound();
  }

  const collectionPosts = isAll
    ? posts.filter((post) => isSaved(post.id))
    : posts.filter((post) =>
        getPostIdsForCollection(collectionId).includes(post.id),
      );

  const title = isAll ? "All Saved" : collection?.name;

  // On "All Saved", removing means fully unsaving — which also cascades
  // to remove it from every collection, per toggleSave's own logic. On a
  // specific collection, removing only takes it out of THIS collection —
  // it stays saved everywhere else it already was.
  function confirmRemove() {
    if (!pendingRemovePostId) return;
    if (isAll) {
      toggleSave(pendingRemovePostId);
    } else {
      toggleCollectionForPost(pendingRemovePostId, collectionId);
    }
    setPendingRemovePostId(null);
  }

  return (
    <RequireAuth>
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
          <p className="text-sm font-medium">{title}</p>
          {/* Rename/delete only makes sense on a real collection, not the
              built-in "All Saved" view */}
          {!isAll && collection && (
            <button
              type="button"
              onClick={() => setOptionsOpen(true)}
              aria-label="Collection options"
            >
              <DotsThreeIcon size={20} className="text-foreground" />
            </button>
          )}
        </div>

        {loading ? (
          <PostGridSkeleton />
        ) : (
          <PostGrid
            posts={collectionPosts}
            emptyTitle="Nothing here yet"
            emptyDescription="Posts you save to this collection will show up here."
            onRemove={setPendingRemovePostId}
          />
        )}

        <ConfirmDialog
          open={pendingRemovePostId !== null}
          title={isAll ? "Remove from Saved?" : `Remove from "${title}"?`}
          description={
            isAll
              ? "This post will no longer be saved."
              : "This post will stay saved elsewhere, just not in this collection."
          }
          confirmLabel="Remove"
          destructive
          onConfirm={confirmRemove}
          onCancel={() => setPendingRemovePostId(null)}
        />

        {!isAll && collection && (
          <CollectionOptionsSheet
            open={optionsOpen}
            onClose={() => setOptionsOpen(false)}
            collectionId={collection.id}
            currentName={collection.name}
            onDeleted={() => router.replace(PATHS.SAVED)}
          />
        )}
      </div>
    </RequireAuth>
  );
}
