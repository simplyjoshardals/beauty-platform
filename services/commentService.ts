import { apiFetch } from "@/utils/apiClient";
import { API_ROUTES } from "@/utils/apiRoutes";
import type { Comment } from "@/types/comment";

export type ListCommentsResult =
  | { success: true; comments: Comment[] }
  | { success: false; error: string };

export async function listComments(
  postId: string,
): Promise<ListCommentsResult> {
  return apiFetch(API_ROUTES.COMMENTS.LIST(postId), { method: "GET" });
}

export type AddCommentResult =
  | { success: true; comment: Comment }
  | { success: false; error: string };

export async function addComment(
  postId: string,
  text: string,
  parentId?: string,
): Promise<AddCommentResult> {
  return apiFetch(API_ROUTES.COMMENTS.CREATE(postId), {
    method: "POST",
    body: JSON.stringify({ text, parentId }),
  });
}

export type DeleteCommentResult =
  | { success: true; mode: "removed" | "placeholder" }
  | { success: false; error: string };

export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<DeleteCommentResult> {
  return apiFetch(API_ROUTES.COMMENTS.DELETE(postId, commentId), {
    method: "DELETE",
  });
}

export type ToggleCommentLikeResult =
  | { success: true; liked: boolean }
  | { success: false; error: string };

export async function toggleCommentLike(
  postId: string,
  commentId: string,
): Promise<ToggleCommentLikeResult> {
  return apiFetch(API_ROUTES.COMMENTS.TOGGLE_LIKE(postId, commentId), {
    method: "POST",
  });
}
