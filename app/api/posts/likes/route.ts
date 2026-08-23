import { NextRequest, NextResponse } from "next/server";
import { getLikedPostIds } from "@/lib/likes";

// Mirrors GET /api/saved's bundle shape — just the ids, not baked into
// each Post the way likeCount is. Keeping "did I like this" as its own
// small fetch (rather than joining it onto every /api/posts response)
// matches how isSaved already works via useSavedPosts, and means this
// route works the same regardless of where the Post objects themselves
// came from.
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const likedPostIds = await getLikedPostIds(userId);
  return NextResponse.json({ success: true, likedPostIds });
}
