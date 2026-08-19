"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSavedBundle,
  toggleSavedPost,
  createCollection as createCollectionRequest,
  renameCollection as renameCollectionRequest,
  deleteCollection as deleteCollectionRequest,
  toggleCollectionPost,
  type SavedCollection,
} from "@/services/savedService";

export type Collection = { id: string; name: string };

const SAVED_QUERY_KEY = ["saved"] as const;

type SavedData = {
  savedPostIds: string[];
  collections: SavedCollection[];
};

const EMPTY_SAVED_DATA: SavedData = { savedPostIds: [], collections: [] };

// apiFetch never throws on a failed request — network errors, timeouts,
// and non-2xx responses all resolve to a `{ success: false }` object
// rather than rejecting (see utils/apiClient.ts). So "did this mutation
// fail" has to be read off the resolved result, not caught via
// useMutation's onError — that's why every mutation below checks
// `result.success` inside onSettled instead.
function mutationFailed(result: { success: boolean } | undefined) {
  return result === undefined || !result.success;
}

// Replaces context/SavedPostsProvider.tsx. Same public shape (isSaved,
// toggleSave, collections, createCollection, renameCollection,
// deleteCollection, isPostInCollection, toggleCollectionForPost,
// getPostIdsForCollection, savedCount) so every existing consumer keeps
// working with only an import-path change — except createCollection,
// which is now async (it has to round-trip to the server to get a real
// id back), so callers that used its return value synchronously need an
// await. No provider wrapping needed: react-query already dedupes/shares
// this cache across every component that calls the hook, same as
// usePosts.
//
// Every mutation below updates the cache optimistically in onMutate
// (so the UI reacts instantly), snapshots the prior cache so it can be
// restored, and in onSettled either rolls back to that snapshot (on
// failure) or leaves the optimistic value in place and refetches to
// reconcile with the server (on success) — same pattern throughout.
export function useSavedPosts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: SAVED_QUERY_KEY,
    queryFn: async (): Promise<SavedData> => {
      const result = await getSavedBundle();
      if (!result?.success) return EMPTY_SAVED_DATA;
      return {
        savedPostIds: result.savedPostIds,
        collections: result.collections,
      };
    },
  });

  const savedPostIds = useMemo(
    () => new Set(query.data?.savedPostIds ?? []),
    [query.data],
  );
  const collections: Collection[] = query.data?.collections ?? [];

  async function snapshotAndCancel() {
    await queryClient.cancelQueries({ queryKey: SAVED_QUERY_KEY });
    return queryClient.getQueryData<SavedData>(SAVED_QUERY_KEY);
  }

  function rollback(previous: SavedData | undefined) {
    if (previous) {
      queryClient.setQueryData(SAVED_QUERY_KEY, previous);
    }
  }

  function refetch() {
    return queryClient.invalidateQueries({ queryKey: SAVED_QUERY_KEY });
  }

  const toggleSaveMutation = useMutation({
    mutationFn: (postId: string) => toggleSavedPost(postId),
    onMutate: async (postId) => {
      const previous = await snapshotAndCancel();
      queryClient.setQueryData<SavedData>(SAVED_QUERY_KEY, (old) => {
        const data = old ?? EMPTY_SAVED_DATA;
        const currentlySaved = data.savedPostIds.includes(postId);
        if (currentlySaved) {
          // Fully unsaving removes it from every collection too — a
          // post can't sit in a folder while not being saved at all,
          // same cascade the server applies.
          return {
            savedPostIds: data.savedPostIds.filter((id) => id !== postId),
            collections: data.collections.map((c) => ({
              ...c,
              postIds: c.postIds.filter((id) => id !== postId),
            })),
          };
        }
        return { ...data, savedPostIds: [...data.savedPostIds, postId] };
      });
      return { previous };
    },
    onSettled: (result, _error, _postId, context) => {
      if (mutationFailed(result)) {
        rollback(context?.previous);
      } else {
        refetch();
      }
    },
  });

  const createCollectionMutation = useMutation({
    mutationFn: (name: string) => createCollectionRequest(name),
    onMutate: async (name) => {
      const previous = await snapshotAndCancel();
      const tempId = `temp-${crypto.randomUUID()}`;
      queryClient.setQueryData<SavedData>(SAVED_QUERY_KEY, (old) => {
        const data = old ?? EMPTY_SAVED_DATA;
        return {
          ...data,
          collections: [...data.collections, { id: tempId, name, postIds: [] }],
        };
      });
      return { previous };
    },
    onSettled: (result, _error, _name, context) => {
      if (mutationFailed(result)) {
        rollback(context?.previous);
      } else {
        // Swaps the temp-id placeholder for the real collection —
        // mutateAsync's resolved value (used by createCollection below)
        // already has the real id regardless of this refetch.
        refetch();
      }
    },
  });

  const renameCollectionMutation = useMutation({
    mutationFn: ({
      collectionId,
      name,
    }: {
      collectionId: string;
      name: string;
    }) => renameCollectionRequest(collectionId, name),
    onMutate: async ({ collectionId, name }) => {
      const previous = await snapshotAndCancel();
      queryClient.setQueryData<SavedData>(SAVED_QUERY_KEY, (old) => {
        const data = old ?? EMPTY_SAVED_DATA;
        return {
          ...data,
          collections: data.collections.map((c) =>
            c.id === collectionId ? { ...c, name } : c,
          ),
        };
      });
      return { previous };
    },
    onSettled: (result, _error, _vars, context) => {
      if (mutationFailed(result)) {
        rollback(context?.previous);
      } else {
        refetch();
      }
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: (collectionId: string) => deleteCollectionRequest(collectionId),
    onMutate: async (collectionId) => {
      const previous = await snapshotAndCancel();
      queryClient.setQueryData<SavedData>(SAVED_QUERY_KEY, (old) => {
        const data = old ?? EMPTY_SAVED_DATA;
        // Only removes the folder/grouping — savedPostIds is untouched,
        // matching the server: deleting a collection never unsaves the
        // posts inside it.
        return {
          ...data,
          collections: data.collections.filter((c) => c.id !== collectionId),
        };
      });
      return { previous };
    },
    onSettled: (result, _error, _collectionId, context) => {
      if (mutationFailed(result)) {
        rollback(context?.previous);
      } else {
        refetch();
      }
    },
  });

  const toggleCollectionPostMutation = useMutation({
    mutationFn: ({
      postId,
      collectionId,
    }: {
      postId: string;
      collectionId: string;
    }) => toggleCollectionPost(collectionId, postId),
    onMutate: async ({ postId, collectionId }) => {
      const previous = await snapshotAndCancel();
      queryClient.setQueryData<SavedData>(SAVED_QUERY_KEY, (old) => {
        const data = old ?? EMPTY_SAVED_DATA;
        const target = data.collections.find((c) => c.id === collectionId);
        const wasInCollection = target?.postIds.includes(postId) ?? false;
        return {
          // Adding to a collection implies the post is saved overall
          // too — same as toggleSaveMutation, but only in the adding
          // direction; removing from one collection never unsaves it.
          savedPostIds:
            !wasInCollection && !data.savedPostIds.includes(postId)
              ? [...data.savedPostIds, postId]
              : data.savedPostIds,
          collections: data.collections.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  postIds: wasInCollection
                    ? c.postIds.filter((id) => id !== postId)
                    : [...c.postIds, postId],
                }
              : c,
          ),
        };
      });
      return { previous };
    },
    onSettled: (result, _error, _vars, context) => {
      if (mutationFailed(result)) {
        rollback(context?.previous);
      } else {
        refetch();
      }
    },
  });

  function isSaved(postId: string) {
    return savedPostIds.has(postId);
  }

  function toggleSave(postId: string) {
    toggleSaveMutation.mutate(postId);
  }

  // Async, unlike the old context version — resolves to the new
  // collection's id (or null on failure) once the server round-trip
  // completes, since there's no client-generated id to hand back
  // synchronously anymore. Reads off mutateAsync's own resolved value,
  // not the cache, so it's correct even though the cache briefly holds
  // a temp-id placeholder (see createCollectionMutation.onMutate above).
  async function createCollection(name: string): Promise<string | null> {
    const result = await createCollectionMutation.mutateAsync(name);
    return result?.success ? result.collection.id : null;
  }

  function renameCollection(collectionId: string, name: string) {
    renameCollectionMutation.mutate({ collectionId, name });
  }

  function deleteCollection(collectionId: string) {
    deleteCollectionMutation.mutate(collectionId);
  }

  function isPostInCollection(postId: string, collectionId: string) {
    const collection = query.data?.collections.find(
      (c) => c.id === collectionId,
    );
    return collection?.postIds.includes(postId) ?? false;
  }

  function toggleCollectionForPost(postId: string, collectionId: string) {
    toggleCollectionPostMutation.mutate({ postId, collectionId });
  }

  function getPostIdsForCollection(collectionId: string): string[] {
    return (
      query.data?.collections.find((c) => c.id === collectionId)?.postIds ?? []
    );
  }

  return {
    isSaved,
    toggleSave,
    collections,
    createCollection,
    renameCollection,
    deleteCollection,
    isPostInCollection,
    toggleCollectionForPost,
    getPostIdsForCollection,
    savedCount: savedPostIds.size,
    isLoading: query.isLoading,
  };
}
