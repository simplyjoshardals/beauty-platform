"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Collection = {
  id: string;
  name: string;
};

type SavedPostsContextValue = {
  isSaved: (postId: string) => boolean;
  toggleSave: (postId: string) => void;

  collections: Collection[];
  createCollection: (name: string) => string;
  renameCollection: (collectionId: string, name: string) => void;
  deleteCollection: (collectionId: string) => void;
  isPostInCollection: (postId: string, collectionId: string) => boolean;
  toggleCollectionForPost: (postId: string, collectionId: string) => void;
  getPostIdsForCollection: (collectionId: string) => string[];

  savedCount: number;
};

const SavedPostsContext = createContext<SavedPostsContextValue | null>(null);

// In-memory only, same caveat as every other provider — resets on refresh.
export function SavedPostsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionPosts, setCollectionPosts] = useState<
    Record<string, Set<string>>
  >({});

  function isSaved(postId: string) {
    return savedIds.has(postId);
  }

  function toggleSave(postId: string) {
    // Read current state from component scope rather than nesting a
    // second setState call inside this one's updater — React's Strict
    // Mode double-invokes updater functions in dev to catch exactly that
    // kind of impurity, which silently double-fires the nested call.
    const currentlySaved = savedIds.has(postId);

    setSavedIds((prev) => {
      const next = new Set(prev);
      if (currentlySaved) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });

    if (currentlySaved) {
      // Fully unsaving removes it from every collection too — a post
      // can't sit in a folder while not being saved at all.
      setCollectionPosts((prev) => {
        let changed = false;
        const updated: Record<string, Set<string>> = {};
        for (const [colId, postSet] of Object.entries(prev)) {
          if (postSet.has(postId)) {
            const s = new Set(postSet);
            s.delete(postId);
            updated[colId] = s;
            changed = true;
          } else {
            updated[colId] = postSet;
          }
        }
        return changed ? updated : prev;
      });
    }
  }

  function createCollection(name: string): string {
    const id = crypto.randomUUID();
    setCollections((prev) => [...prev, { id, name }]);
    setCollectionPosts((prev) => ({ ...prev, [id]: new Set() }));
    return id;
  }

  function renameCollection(collectionId: string, name: string) {
    setCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, name } : c)),
    );
  }

  function deleteCollection(collectionId: string) {
    // Only removes the folder/grouping — the posts inside it stay saved
    // overall (and in any other collection they were also part of).
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    setCollectionPosts((prev) => {
      const next = { ...prev };
      delete next[collectionId];
      return next;
    });
  }

  function isPostInCollection(postId: string, collectionId: string) {
    return collectionPosts[collectionId]?.has(postId) ?? false;
  }

  function toggleCollectionForPost(postId: string, collectionId: string) {
    const currentSet = collectionPosts[collectionId] ?? new Set<string>();
    const isCurrentlyIn = currentSet.has(postId);

    setCollectionPosts((prev) => {
      const base = prev[collectionId] ?? new Set<string>();
      const next = new Set(base);
      if (isCurrentlyIn) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return { ...prev, [collectionId]: next };
    });

    // Adding to a collection implies the post is saved overall too.
    if (!isCurrentlyIn) {
      setSavedIds((prev) => {
        if (prev.has(postId)) return prev;
        const next = new Set(prev);
        next.add(postId);
        return next;
      });
    }
  }

  function getPostIdsForCollection(collectionId: string): string[] {
    return Array.from(collectionPosts[collectionId] ?? []);
  }

  return (
    <SavedPostsContext.Provider
      value={{
        isSaved,
        toggleSave,
        collections,
        createCollection,
        renameCollection,
        deleteCollection,
        isPostInCollection,
        toggleCollectionForPost,
        getPostIdsForCollection,
        savedCount: savedIds.size,
      }}
    >
      {children}
    </SavedPostsContext.Provider>
  );
}

export function useSavedPosts() {
  const ctx = useContext(SavedPostsContext);
  if (!ctx) {
    throw new Error("useSavedPosts must be used within a SavedPostsProvider");
  }
  return ctx;
}
