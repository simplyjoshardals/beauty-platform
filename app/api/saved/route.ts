import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSavedBundle } from "@/lib/saved";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const [savedPosts, collections] = await Promise.all([
    prisma.savedPost.findMany({
      where: { userId },
      select: {
        postId: true,
        collections: { select: { collectionId: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.collection.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({
    success: true,
    ...buildSavedBundle(savedPosts, collections),
  });
}

// Toggles a post's overall saved state — mirrors SavedPostsProvider's old
// toggleSave exactly: unsaving cascades to every collection the post was
// in (CollectionPost rows cascade-delete along with their SavedPost
// parent, per the schema's onDelete: Cascade), saving just creates the
// base fact.
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { postId } = await req.json();
    if (typeof postId !== "string" || !postId) {
      return NextResponse.json(
        { success: false, error: "Invalid post." },
        { status: 400 },
      );
    }

    const existing = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.savedPost.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, saved: false });
    }

    await prisma.savedPost.create({ data: { userId, postId } });
    return NextResponse.json({ success: true, saved: true });
  } catch (err) {
    console.error("toggle saved post error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
