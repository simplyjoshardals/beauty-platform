import { apiFetch } from "@/utils/apiClient";
import { API_ROUTES } from "@/utils/apiRoutes";

export type SavedCollection = {
  id: string;
  name: string;
  postIds: string[];
};

export type SavedBundleResult =
  | { success: true; savedPostIds: string[]; collections: SavedCollection[] }
  | { success: false; error: string };

export async function getSavedBundle(): Promise<SavedBundleResult> {
  return apiFetch(API_ROUTES.SAVED.BUNDLE, { method: "GET" });
}

export type ToggleSaveResult =
  | { success: true; saved: boolean }
  | { success: false; error: string };

export async function toggleSavedPost(
  postId: string,
): Promise<ToggleSaveResult> {
  return apiFetch(API_ROUTES.SAVED.TOGGLE_SAVE, {
    method: "POST",
    body: JSON.stringify({ postId }),
  });
}

export type CreateCollectionResult =
  | { success: true; collection: { id: string; name: string } }
  | { success: false; error: string };

export async function createCollection(
  name: string,
): Promise<CreateCollectionResult> {
  return apiFetch(API_ROUTES.SAVED.CREATE_COLLECTION, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export type RenameCollectionResult =
  | { success: true; collection: { id: string; name: string } }
  | { success: false; error: string };

export async function renameCollection(
  collectionId: string,
  name: string,
): Promise<RenameCollectionResult> {
  return apiFetch(API_ROUTES.SAVED.RENAME_COLLECTION(collectionId), {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export type DeleteCollectionResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteCollection(
  collectionId: string,
): Promise<DeleteCollectionResult> {
  return apiFetch(API_ROUTES.SAVED.DELETE_COLLECTION(collectionId), {
    method: "DELETE",
  });
}

export type ToggleCollectionPostResult =
  | { success: true; inCollection: boolean }
  | { success: false; error: string };

export async function toggleCollectionPost(
  collectionId: string,
  postId: string,
): Promise<ToggleCollectionPostResult> {
  return apiFetch(API_ROUTES.SAVED.TOGGLE_COLLECTION_POST(collectionId), {
    method: "POST",
    body: JSON.stringify({ postId }),
  });
}
