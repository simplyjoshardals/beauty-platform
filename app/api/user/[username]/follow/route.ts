import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

type Params = { params: Promise<{ username: string }> };

// x-user-id is set by proxy.ts, which already validated the session
// before this route runs — same trust model as every other protected
// route. Mirrors app/api/posts/[postId]/like/route.ts's toggle exactly:
// check-then-create/delete against the Follow join table rather than a
// boolean, so "am I following them" stays a real per-pair fact and
// followerCount/followingCount (Follow._count in the GET above) can
// never drift out of sync with it.
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { username } = await params;

    const target = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 },
      );
    }

    if (target.id === userId) {
      return NextResponse.json(
        { success: false, error: "You can't follow yourself." },
        { status: 400 },
      );
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: userId, followingId: target.id },
      },
      select: { id: true },
    });

    if (existing) {
      // Unfollowing never retracts a notification, same as the like
      // routes.
      await prisma.follow.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, following: false });
    }

    await prisma.follow.create({
      data: { followerId: userId, followingId: target.id },
    });
    await createNotification({
      recipientId: target.id,
      actorId: userId,
      type: "FOLLOW",
    });
    return NextResponse.json({ success: true, following: true });
  } catch (err) {
    console.error("toggle follow error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
