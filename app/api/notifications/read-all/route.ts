import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Intentionally no per-notification read endpoint — Option B (see
// hooks/useNotifications.ts + app/notifications/page.tsx) always marks
// every unread notification as read the moment the page is opened, so
// there's never a case where the frontend needs to mark just one.
export async function PATCH(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  await prisma.notification.updateMany({
    where: { recipientId: userId, read: false },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}