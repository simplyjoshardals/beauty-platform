import type { Comment } from "@/types/comment";

export const MAX_COMMENT_LENGTH = 1000;

// Shape this file needs from a Prisma Comment row — hand-rolled, same
// convention as lib/posts.ts's PostRecord and lib/saved.ts's
// SavedPostRecord, so this has no compile-time dependency on the
// generated client. `likes` is only ever the CURRENT user's like row for
// this comment (queried with `where: { userId }`), not every like — see
// the `likes` include below.
export type CommentRecord = {
  id: string;
  text: string;
  deleted: boolean;
  parentId: string | null;
  createdAt: Date;
  author: { id: string; username: string; avatarSrc: string };
  _count: { likes: number };
  likes: { id: string }[];
  replies?: CommentRecord[];
};

function serializeOne(comment: CommentRecord): Comment {
  return {
    id: comment.id,
    author: comment.author,
    // A soft-deleted comment's real text never leaves the server — the
    // frontend placeholder ("Comment deleted") is driven purely off the
    // `deleted` flag, so there's nothing to accidentally leak by keeping
    // the row around for its replies' sake.
    text: comment.deleted ? "" : comment.text,
    likeCount: comment._count.likes,
    likedByMe: comment.likes.length > 0,
    createdAt: comment.createdAt.toISOString(),
    deleted: comment.deleted || undefined,
    replies: comment.replies?.map(serializeOne),
  };
}

// Top-level comments only — reply serialization happens as part of each
// top-level comment's `replies`, matching the one-level-deep nesting the
// schema and every frontend consumer (sortComments, CommentItem) already
// assume.
export function serializeComments(comments: CommentRecord[]): Comment[] {
  return comments.map(serializeOne);
}

export function serializeComment(comment: CommentRecord): Comment {
  return serializeOne(comment);
}
