import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ postId: string }> };

// x-user-id is set by proxy.ts, which already validated the session
// before this route runs — same trust model as every other protected
// route (/api/user/me, /api/posts, etc).
//
// Everything hanging off a Post — CarouselItem, ProductTag, Like,
// Comment, SavedPost, Notification — cascades on delete per
// prisma/schema.prisma, so a plain delete here is enough; there's
// nothing left over to clean up by hand. Deleting a post never unsaves
// it for other users in a way that needs separate handling either —
// SavedPost rows for it just cascade away along with everything else.
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const { postId } = await params;

    // Scoped by authorId as well as id, and deleteMany (not delete) —
    // so trying to delete someone else's post just matches zero rows
    // instead of throwing, and `count` is how we tell the difference
    // between "not yours" and "doesn't exist."
    const result = await prisma.post.deleteMany({
      where: { id: postId, authorId: userId },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "Post not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete post error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
