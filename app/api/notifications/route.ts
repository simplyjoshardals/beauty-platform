import { NextRequest, NextResponse } from "next/server";
import { getNotificationsForUser } from "@/lib/notifications";

// x-user-id is set by proxy.ts, which already validated the session
// before this route runs — see the isProtectedRoute list there, which
// includes /api/notifications. There's no public GET carve-out here
// (unlike GET /api/posts/[postId]/comments): a person's notifications
// are never visible to anyone but themselves.
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    notifications: await getNotificationsForUser(userId),
  });
}
