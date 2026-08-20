import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ postId: string }> };

// x-user-id is set by proxy.ts, which already validated the session
// before this route runs — same trust model as every other protected
// route under /api/posts. Mirrors app/api/saved/route.ts's POST exactly:
// check-then-create/delete rather than a boolean column, so "have I
// liked this" stays a real per-user fact (Like is a join table, per
// prisma/schema.prisma) and likeCount (Post._count.likes) can never
// drift out of sync with it.
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found." },
        { status: 404 },
      );
    }

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, liked: false });
    }

    await prisma.like.create({ data: { postId, userId } });
    return NextResponse.json({ success: true, liked: true });
  } catch (err) {
    console.error("toggle post like error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
