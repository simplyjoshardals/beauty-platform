import { NextRequest, NextResponse } from "next/server";
import { revokeRefreshToken, revokeAllRefreshTokens } from "@/lib/auth";
import { clearSessionCookies } from "@/lib/authCookies";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    const uid = req.cookies.get("uid")?.value;

    let logoutAll = false;
    try {
      const body = await req.json();
      logoutAll = Boolean(body?.logoutAll);
    } catch {
      // No/empty body — fine, defaults to logging out just this session.
    }

    if (logoutAll && uid) {
      await revokeAllRefreshTokens(uid);
    } else if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    const response = NextResponse.json({ success: true }, { status: 200 });
    clearSessionCookies(response);
    return response;
  } catch (err) {
    console.error("logout error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
