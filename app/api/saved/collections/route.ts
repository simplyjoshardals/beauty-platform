import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MAX_COLLECTION_NAME_LENGTH } from "@/lib/saved";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

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

    const collection = await prisma.collection.create({
      data: { userId, name: trimmed },
      select: { id: true, name: true },
    });

    return NextResponse.json({ success: true, collection });
  } catch (err) {
    console.error("create collection error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
