import { apiFetch } from "@/utils/apiClient";
import { API_ROUTES } from "@/utils/apiRoutes";

export type LikedBundleResult =
  | { success: true; likedPostIds: string[] }
  | { success: false; error: string };

export async function getLikedPostIds(): Promise<LikedBundleResult> {
  return apiFetch(API_ROUTES.POSTS.LIKES_BUNDLE, { method: "GET" });
}

export type ToggleLikeResult =
  | { success: true; liked: boolean }
  | { success: false; error: string };

export async function togglePostLike(
  postId: string,
): Promise<ToggleLikeResult> {
  return apiFetch(API_ROUTES.POSTS.TOGGLE_LIKE(postId), { method: "POST" });
}
