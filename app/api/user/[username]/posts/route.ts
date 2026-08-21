import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializePost, postInclude } from "@/lib/posts";

type Params = { params: Promise<{ username: string }> };

// Same take-50-no-pagination-yet posture as GET /api/posts (see
// app/api/posts/route.ts) — fine for a profile grid this size today,
// swap for real cursor pagination once it matters.
const PROFILE_POSTS_TAKE = 50;

// Public read, same as GET /api/user/[username] itself — this is what
// both /u/[username] and /profile now call for the post grid, instead
// of pulling the whole 50-post feed via usePosts() and filtering it down
// to one author client-side. Public rather than gated on x-user-id
// because /u/[username] is browsable logged out (see the comment on
// RequireAuth); /profile is behind RequireAuth on the frontend, but
// there's no reason for this route itself to care who's asking — a
// user's posts are the same list either way.
export async function GET(req: NextRequest, { params }: Params) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found." },
      { status: 404 },
    );
  }

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    include: postInclude,
    orderBy: { createdAt: "desc" },
    take: PROFILE_POSTS_TAKE,
  });

  return NextResponse.json({
    success: true,
    posts: posts.map(serializePost),
  });
}
