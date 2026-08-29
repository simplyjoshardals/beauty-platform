import type { Comment } from "@/types/comment";

// Compares by id, not username — this "is the post's author the same
// person as this comment's author" check needs to stay correct even if
// either of them renamed themselves since the comment was posted.

// Tier 0: the author's own comment
// Tier 1: someone else's comment that the author has already replied to
// Tier 2: someone else's comment the author hasn't engaged with yet
function getEngagementTier(comment: Comment, authorId: string): 0 | 1 | 2 {
  if (comment.author.id === authorId) return 0;
  const hasAuthorReply = comment.replies?.some(
    (reply) => reply.author.id === authorId,
  );
  return hasAuthorReply ? 1 : 2;
}

// Orders a list of top-level comments: the author's own comments first,
// then threads the author has already replied to, then everything still
// waiting for a response. Array.sort is stable in modern JS engines, so
// relative order within each tier is otherwise preserved.
export function sortByAuthorEngagement(
  comments: Comment[],
  authorId: string,
): Comment[] {
  return [...comments].sort(
    (a, b) => getEngagementTier(a, authorId) - getEngagementTier(b, authorId),
  );
}

// Replies within a single thread (one level deep — replies don't have
// their own sub-replies) are deliberately NOT reordered here — they're
// rendered in the plain chronological order comment.replies already
// arrives in (see app/api/posts/[postId]/comments/route.ts's
// orderBy: createdAt asc, and useComments' optimistic add appending to
// the end). This used to bunch the author's replies to the front of
// the thread, but a reply is a response to whatever came right before
// it — moving it away from that context (which happened the moment the
// author replied more than once in the same thread) made a
// back-and-forth harder to follow, not easier. CommentItem's "Author"
// label marks authorship instead, in place.
