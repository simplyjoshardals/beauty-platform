import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ collectionId: string }> };

// Toggles whether a post sits inside this collection. Mirrors
// SavedPostsProvider's old toggleCollectionForPost: adding to a
// collection implies the post is saved overall too (the SavedPost row
// is upserted here rather than required to already exist); removing
// from a collection only takes it out of THIS collection — the post
// stays saved everywhere else it already was.
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const { collectionId } = await params;

    const { postId } = await req.json();
    if (typeof postId !== "string" || !postId) {
      return NextResponse.json(
        { success: false, error: "Invalid post." },
        { status: 400 },
      );
    }

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    });
    if (!collection || collection.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Collection not found." },
        { status: 404 },
      );
    }

    const savedPost = await prisma.savedPost.upsert({
      where: { userId_postId: { userId, postId } },
      create: { userId, postId },
      update: {},
      select: { id: true },
    });

    const existingLink = await prisma.collectionPost.findUnique({
      where: {
        collectionId_savedPostId: {
          collectionId,
          savedPostId: savedPost.id,
        },
      },
      select: { id: true },
    });

    if (existingLink) {
      await prisma.collectionPost.delete({ where: { id: existingLink.id } });
      return NextResponse.json({ success: true, inCollection: false });
    }

    await prisma.collectionPost.create({
      data: { collectionId, savedPostId: savedPost.id },
    });
    return NextResponse.json({ success: true, inCollection: true });
  } catch (err) {
    console.error("toggle collection post error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
