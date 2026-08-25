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

// Backs useUserPosts — GET /api/user/[username]/posts, a dedicated route
// that queries Post by authorId directly rather than pulling the whole
// feed and filtering client-side. Public, same as GET /api/user/[username]
// itself (see the route's own comment): /u/[username] is browsable
// logged out, so this can't require auth the way listPosts() effectively
// does.
export async function getUserPosts(username: string): Promise<ListPostsResult> {
  return apiFetch(API_ROUTES.USER.POSTS(username), {
    method: "GET",
    authRequired: false,
  });
}

// Backs useExplorePosts — GET /api/explore, a dedicated route running
// its own hot-ranked query (getExploreFeedPosts) rather than filtering
// the result of listPosts() above client-side. authRequired defaults to
// true (unlike listPosts's override): Explore has no logged-out/public
// permalink case to protect against the way /p/[postId] does for
// listPosts, so a 401 here should behave like any other protected
// fetch — attempt a refresh, then redirect to sign-in.
export async function listExplorePosts(): Promise<ListPostsResult> {
  return apiFetch(API_ROUTES.EXPLORE.LIST, { method: "GET" });
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
