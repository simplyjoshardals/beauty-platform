import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ postId: string; commentId: string }> };

// Mirrors the delete logic that used to live in PostCard's
// handleDeleteComment, moved server-side:
// - A reply is always a full, silent removal — replies never have their
//   own sub-replies to preserve, so there's nothing to keep a
//   placeholder for.
// - A top-level comment with replies underneath becomes a "[deleted]"
//   placeholder (deleted: true) — the row stays so those replies stay
//   reachable, but its text is stripped (see lib/comments.ts).
// - A top-level comment with no replies is removed outright.
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const { postId, commentId } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        postId: true,
        authorId: true,
        parentId: true,
        deleted: true,
        post: { select: { authorId: true } },
        _count: { select: { replies: true } },
      },
    });

    if (!comment || comment.postId !== postId || comment.deleted) {
      return NextResponse.json(
        { success: false, error: "Comment not found." },
        { status: 404 },
      );
    }

    // Own comment, or the post's own author moderating their post —
    // same rule CommentItem's canDelete already enforced client-side.
    const canDelete =
      comment.authorId === userId || comment.post.authorId === userId;
    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: "Not allowed." },
        { status: 403 },
      );
    }

    const isReply = comment.parentId !== null;
    const hasReplies = comment._count.replies > 0;

    if (!isReply && hasReplies) {
      await prisma.comment.update({
        where: { id: commentId },
        data: { deleted: true },
      });
      return NextResponse.json({ success: true, mode: "placeholder" });
    }

    // CommentLike rows cascade away with it (onDelete: Cascade), nothing
    // left over to clean up by hand.
    await prisma.comment.delete({ where: { id: commentId } });
    return NextResponse.json({ success: true, mode: "removed" });
  } catch (err) {
    console.error("delete comment error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
