import { NextRequest, NextResponse } from "next/server";
import { getFollowersList } from "@/lib/users";

type Params = { params: Promise<{ username: string }> };

// Mirrors app/api/user/[username]/following/route.ts exactly, just the
// reverse Follow direction — same auth posture (not part of proxy.ts's
// public-GET carve-out, plus the explicit x-user-id check below as
// defense-in-depth), same optional ?search=, and the same
// lib/users.ts-backed query (getFollowersList) instead of an inline
// prisma call duplicating it — including the batched
// isFollowing/followsMe/isSelf relationship state per row (see that
// file's attachViewerRelationship). That single implementation is what
// the SSR prefetch for /profile/followers and /u/[username]/followers
// calls directly too (see lib/serverQueries.ts's fetchFollowersForSSR).
export async function GET(req: NextRequest, { params }: Params) {
  const viewerId = req.headers.get("x-user-id");
  if (!viewerId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { username } = await params;
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const users = await getFollowersList(username, search, viewerId);
  if (users === null) {
    return NextResponse.json(
      { success: false, error: "User not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, users });
}
