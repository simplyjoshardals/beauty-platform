import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  serializeComments,
  serializeComment,
  MAX_COMMENT_LENGTH,
} from "@/lib/comments";

type Params = { params: Promise<{ postId: string }> };

// Shared between GET and POST — a comment/reply returned right after
// creation needs the exact same shape as one that comes back from the
// list, same reasoning as postInclude in app/api/posts/route.ts.
function commentInclude(userId: string) {
  return {
    author: { select: { id: true, username: true, avatarSrc: true } },
    _count: { select: { likes: true } },
    // Only ever the current user's own like row (0 or 1), never every
    // like — that's all `likedByMe` in lib/comments.ts needs, and it
    // keeps this include cheap no matter how popular a comment gets.
    likes: { where: { userId }, select: { id: true } },
  } as const;
}

// Deliberately public — no x-user-id check. Backs the /p/[postId]
// permalink page's comment list, same public/authenticated split as
// GET /api/posts/[postId] (see proxy.ts's isPublicPostGet for the
// matching carve-out). An anonymous visitor still gets the full comment
// list, just with likedByMe forced false for every comment (see the
// empty-string userId passed to commentInclude below — no real user id
// is ever an empty string, so that filter matches zero rows). POST
// (creating a comment) stays behind the auth gate below, unchanged.
export async function GET(req: NextRequest, { params }: Params) {
  const userId = req.headers.get("x-user-id") || "";
  const { postId } = await params;

  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    include: {
      ...commentInclude(userId),
      replies: {
        include: commentInclude(userId),
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    success: true,
    comments: serializeComments(comments),
  });
}

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

    const body = await req.json();
    const { text, parentId } = body;

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment can't be empty." },
        { status: 400 },
      );
    }
    const trimmed = text.trim();
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { success: false, error: "Comment is too long." },
        { status: 400 },
      );
    }

    if (parentId !== undefined) {
      if (typeof parentId !== "string" || !parentId) {
        return NextResponse.json(
          { success: false, error: "Invalid reply target." },
          { status: 400 },
        );
      }
      // Must belong to the same post and be a top-level comment itself —
      // enforces the one-level-deep nesting the schema and frontend both
      // assume; a reply-to-a-reply would have nowhere to render.
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { postId: true, parentId: true },
      });
      if (!parent || parent.postId !== postId || parent.parentId !== null) {
        return NextResponse.json(
          { success: false, error: "Invalid reply target." },
          { status: 400 },
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        text: trimmed,
        parentId: parentId ?? null,
      },
      include: commentInclude(userId),
    });

    return NextResponse.json({
      success: true,
      comment: serializeComment({
        id: comment.id,
        text: comment.text,
        deleted: comment.deleted,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        author: comment.author,
        _count: comment._count,
        likes: comment.likes,
        replies: [],
      }),
    });
  } catch (err) {
    console.error("create comment error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
