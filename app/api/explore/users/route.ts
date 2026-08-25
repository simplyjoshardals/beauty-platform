import { NextRequest, NextResponse } from "next/server";
import { searchUsers } from "@/lib/users";

// GET /api/explore/users?search=... — backs the "search people" box on
// /explore (see components/explore/ExploreFeed.tsx). Falls under
// /api/explore in proxy.ts's isProtectedRoute list, so this is already
// gated to signed-in requests same as GET /api/explore itself; the
// x-user-id check below is just defense-in-depth, same posture as the
// followers/following routes.
//
// Unlike GET /api/user/[username]/following|followers, `search` isn't
// optional here — an empty/missing query returns no results rather than
// every user in the app, since there's no follow relationship to bound
// the set. searchUsers itself also short-circuits on an empty query for
// the same reason. The viewer's own account is included in results (see
// searchUsers) so searching your own username surfaces your own profile
// too, same as anyone else's.
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
  const users = search ? await searchUsers(search, userId) : [];

  return NextResponse.json({ success: true, users });
}
