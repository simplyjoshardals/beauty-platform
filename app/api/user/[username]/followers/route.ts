import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ username: string }> };

// Mirrors app/api/user/[username]/following/route.ts exactly, just the
// reverse Follow direction (followingId = target, not followerId) — same
// auth posture (not part of proxy.ts's public-GET carve-out, plus the
// explicit x-user-id check below as defense-in-depth), same trimmed
// field selection, same optional ?search=.
export async function GET(req: NextRequest, { params }: Params) {
  const viewerId = req.headers.get("x-user-id");
  if (!viewerId) {
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

  const search = req.nextUrl.searchParams.get("search")?.trim();

  const follows = await prisma.follow.findMany({
    where: {
      followingId: target.id,
      ...(search
        ? {
            follower: {
              username: { contains: search, mode: "insensitive" },
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      follower: {
        select: {
          id: true,
          username: true,
          avatarSrc: true,
          toneTag: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    users: follows.map((f) => f.follower),
  });
}
