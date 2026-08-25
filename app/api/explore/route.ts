import { NextRequest, NextResponse } from "next/server";
import { getExploreFeedPosts } from "@/lib/posts";

// x-user-id is set by proxy.ts. GET /api/explore is a protected route
// (see proxy.ts's isProtectedRoute — no public-GET carve-out, same
// posture as GET /api/posts: there's no logged-out "browse explore"
// case), so by the time a request reaches here proxy has already
// enforced a hard 401 for a missing/invalid session; the check below is
// just defense in depth, not the primary gate.
//
// v1 explore algorithm lives in getExploreFeedPosts (lib/posts.ts): a
// hot-ranked (engagement over recency decay) feed of posts from accounts
// the viewer doesn't already follow and isn't themself — a dedicated
// query, not a filtered slice of GET /api/posts's home feed, since the
// candidate set and the ranking are both different.
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const posts = await getExploreFeedPosts(userId);

  return NextResponse.json({ success: true, posts });
}
