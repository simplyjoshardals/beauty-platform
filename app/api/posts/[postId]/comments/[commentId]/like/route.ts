import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ postId: string; commentId: string }> };

// Same check-then-create/delete pattern as the post-level like route —
// CommentLike is its own join table (prisma/schema.prisma) for the same
// reason Like is: "did I like this comment" needs to be a real per-user
// fact, not a boolean column on Comment.
export async function POST(req: NextRequest, { params }: Params) {
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
      select: { postId: true, deleted: true },
    });
    if (!comment || comment.postId !== postId || comment.deleted) {
      return NextResponse.json(
        { success: false, error: "Comment not found." },
        { status: 404 },
      );
    }

    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, liked: false });
    }

    await prisma.commentLike.create({ data: { commentId, userId } });
    return NextResponse.json({ success: true, liked: true });
  } catch (err) {
    console.error("toggle comment like error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
