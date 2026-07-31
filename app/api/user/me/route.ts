import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// x-user-id is set by proxy.ts, which already validated the access/
// refresh token cookies before this route ever runs — this handler
// trusts that header rather than re-verifying anything itself.
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarSrc: user.avatarSrc,
    },
  });
}
