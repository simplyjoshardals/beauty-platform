import { NextRequest, NextResponse } from "next/server";
import { getPublicUserProfile } from "@/lib/users";

type Params = { params: Promise<{ username: string }> };

// Public read — this is the /u/[username] page's data source, and that
// page is intentionally browsable while logged out (see the comment on
// RequireAuth about /p/[postId] and /u/[username] being the two
// action-gated-not-page-gated routes). proxy.ts carves this route out as
// a public GET the same way it already does for /api/posts/[postId], but
// still runs it through token verification first — so a logged-in
// visitor still gets x-user-id set below, which is what lets
// isFollowing/followsMe be computed for them even though the route
// itself doesn't require auth.
//
// followerCount/followingCount are real counts off the Follow table
// (unlike CURRENT_USER_PROFILE.followerCount in data/currentUserProfile.ts,
// which is still a hardcoded placeholder — there's just no consumer of
// "who follows me" for your OWN profile yet). isFollowing/followsMe are
// real too. The one thing still owed to a real backend here is the
// follow *action* everywhere else in the app (PostCard, NotificationRow,
// UserListRow all still read/write context/FollowProvider's local
// Set) — this route and its sibling follow/route.ts are the first real
// piece of that; wiring the rest through is a separate pass.
export async function GET(req: NextRequest, { params }: Params) {
  const { username } = await params;

  const viewerId = req.headers.get("x-user-id");
  const profile = await getPublicUserProfile(username, viewerId);
  if (!profile) {
    return NextResponse.json(
      { success: false, error: "User not found." },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, user: profile });
}
