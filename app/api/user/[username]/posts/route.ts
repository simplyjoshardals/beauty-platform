import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPostsByUserId } from "@/lib/posts";

type Params = { params: Promise<{ username: string }> };

// Public read, same as GET /api/user/[username] itself — this is what
// both /u/[username] and /profile now call for the post grid, instead
// of pulling the whole 50-post feed via usePosts() and filtering it down
// to one author client-side. Public rather than gated on x-user-id
// because /u/[username] is browsable logged out (see the comment on
// RequireAuth); /profile is behind RequireAuth on the frontend, but
// there's no reason for this route itself to care who's asking — a
// user's posts are the same list either way.
//
// The actual posts query lives in getPostsByUserId (lib/posts.ts),
// shared with lib/serverQueries.ts's fetchUserPostsForSSR — this route
// just still owns its own user lookup, since it needs the id either way
// to 404 on a nonexistent username.
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

  const posts = await getPostsByUserId(user.id);

  return NextResponse.json({ success: true, posts });
}
