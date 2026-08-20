import { apiFetch } from "@/utils/apiClient";
import { API_ROUTES } from "@/utils/apiRoutes";
import type { Post } from "@/types/post";

export type CreatePostProduct = { label: string };

// Mirrors the per-mediaType fields app/api/posts/route.ts actually reads —
// every field here must already be a real Cloudinary URL from
// useUploadMedia, never a blob: URL. The route re-validates ownership of
// each URL server-side regardless, but the caller should never be
// passing anything else in the first place.
export type CreatePostInput = {
  mediaType: "IMAGE" | "CAROUSEL" | "VIDEO" | "BEFORE_AFTER";
  caption?: string;
  products?: CreatePostProduct[];
  // IMAGE
  imageSrc?: string;
  imageAlt?: string;
  // CAROUSEL
  carouselItems?: { src: string; alt?: string }[];
  // VIDEO
  videoSrc?: string;
  // BEFORE_AFTER
  beforeSrc?: string;
  beforeAlt?: string;
  afterSrc?: string;
  afterAlt?: string;
};

export type ListPostsResult =
  | { success: true; posts: Post[] }
  | { success: false; error: string };

export async function listPosts(): Promise<ListPostsResult> {
  // authRequired: false — see the identical comment in likeService.ts's
  // getLikedPostIds. usePosts() is called unconditionally by PostCard
  // (for deletePost), which also renders on the public /p/[postId] page.
  // For a logged-out visitor GET /api/posts correctly 401s (the feed
  // list itself is never public), but that should just resolve to an
  // empty list here — not trigger apiFetch's refresh-then-hard-redirect
  // path and boot the visitor off the permalink page.
  return apiFetch(API_ROUTES.POSTS.LIST, {
    method: "GET",
    authRequired: false,
  });
}

export type CreatePostResult =
  | { success: true; post: Post }
  | { success: false; error: string };

export async function createPost(
  data: CreatePostInput,
): Promise<CreatePostResult> {
  return apiFetch(API_ROUTES.POSTS.CREATE, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export type DeletePostResult =
  | { success: true }
  | { success: false; error: string };

export async function deletePost(postId: string): Promise<DeletePostResult> {
  return apiFetch(API_ROUTES.POSTS.DELETE(postId), { method: "DELETE" });
}
