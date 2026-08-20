import { apiFetch } from "@/utils/apiClient";
import { API_ROUTES } from "@/utils/apiRoutes";

export type LikedBundleResult =
  | { success: true; likedPostIds: string[] }
  | { success: false; error: string };

export async function getLikedPostIds(): Promise<LikedBundleResult> {
  // authRequired: false — this fires unconditionally from useLikedPosts,
  // including on the public /p/[postId] page for logged-out visitors.
  // Without this, apiFetch's default 401 handling kicks in (attempt
  // refresh, then hard-redirect to /auth via window.location.href),
  // which would boot an anonymous visitor off an intentionally-public
  // page just because they have no likes to report. A 401 here just
  // means "not logged in," which the caller already treats as empty.
  return apiFetch(API_ROUTES.POSTS.LIKES_BUNDLE, {
    method: "GET",
    authRequired: false,
  });
}

export type ToggleLikeResult =
  | { success: true; liked: boolean }
  | { success: false; error: string };

export async function togglePostLike(
  postId: string,
): Promise<ToggleLikeResult> {
  return apiFetch(API_ROUTES.POSTS.TOGGLE_LIKE(postId), { method: "POST" });
}
