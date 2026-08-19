import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MAX_COLLECTION_NAME_LENGTH } from "@/lib/saved";

type Params = { params: Promise<{ collectionId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const { collectionId } = await params;

    const { name } = await req.json();
    if (typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid name." },
        { status: 400 },
      );
    }
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > MAX_COLLECTION_NAME_LENGTH) {
      return NextResponse.json(
        { success: false, error: "Invalid collection name." },
        { status: 400 },
      );
    }

    // Scoped by userId as well as id, and updateMany (not update) — so
    // trying to rename someone else's collection just matches zero rows
    // instead of throwing, and `count` is how we tell the difference.
    const result = await prisma.collection.updateMany({
      where: { id: collectionId, userId },
      data: { name: trimmed },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "Collection not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      collection: { id: collectionId, name: trimmed },
    });
  } catch (err) {
    console.error("rename collection error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const { collectionId } = await params;

    // Only removes the folder/grouping — CollectionPost rows cascade
    // along with it, but SavedPost never does (Collection has no direct
    // relation to SavedPost), so the posts inside stay saved overall.
    const result = await prisma.collection.deleteMany({
      where: { id: collectionId, userId },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "Collection not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete collection error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
