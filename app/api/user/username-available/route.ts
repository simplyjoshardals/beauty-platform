import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { USERNAME_PATTERN } from "@/constants/username";

// x-user-id (set by proxy.ts) is used to exclude the caller's OWN
// current username from counting as "taken" — otherwise someone
// re-checking their own existing name would incorrectly see it flagged.
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const usernameParam = req.nextUrl.searchParams.get("username");
  if (!usernameParam) {
    return NextResponse.json(
      { success: false, error: "Missing username" },
      { status: 400 },
    );
  }

  const normalized = usernameParam.trim().toLowerCase();

  if (!USERNAME_PATTERN.test(normalized)) {
    return NextResponse.json({ success: true, available: false });
  }

  const existing = await prisma.user.findUnique({
    where: { username: normalized },
  });

  const available = !existing || existing.id === userId;

  return NextResponse.json({ success: true, available });
}
