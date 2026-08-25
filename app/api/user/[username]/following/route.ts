import { NextRequest, NextResponse } from "next/server";
import { getFollowingList } from "@/lib/users";

type Params = { params: Promise<{ username: string }> };

// Requires authentication — unlike GET /api/user/[username] and its
// /posts sibling, this route is deliberately NOT part of proxy.ts's
// public-GET carve-out (see isPublicUserGet there), so an unauthenticated
// request never even reaches this handler with a usable session. The
// x-user-id check below is defense-in-depth, mirroring the same explicit
// check in follow/route.ts, rather than the only thing standing between
// this data and a logged-out caller.
//
// Returns the users the given username follows, most recent first. Only
// the fields UserListRow actually renders are selected — id (React key /
// self-follow check upstream), username, avatarSrc, toneTag — nothing
// else off the target rows leaks through.
//
// Accepts an optional ?search= for a case-insensitive username filter —
// used by both Following pages' server-side search (see
// hooks/useFollowingList.ts), same as its followers/route.ts sibling.
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

  const users = await getFollowingList(username, search);
  if (users === null) {
    return NextResponse.json(
      { success: false, error: "User not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, users });
}
