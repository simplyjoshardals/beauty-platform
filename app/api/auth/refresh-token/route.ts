import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkRefreshToken,
  rotateRefreshToken,
  signAccessToken,
} from "@/lib/auth";
import { setSessionCookies, clearSessionCookies } from "@/lib/authCookies";

// Called explicitly by apiClient.ts on a 401 — a heavier, full token
// rotation. Distinct from proxy.ts's own inline refresh, which just
// silently reissues an access token on every request without rotating
// the refresh token; rotating on every single request would be wasteful.
export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    const uid = req.cookies.get("uid")?.value;

    if (!refreshToken || !uid) {
      return NextResponse.json(
        { success: false, error: "No session" },
        { status: 401 },
      );
    }

    const result = await checkRefreshToken(uid, refreshToken);

    if (result.status === "reused") {
      // Every session for this user was just revoked inside
      // checkRefreshToken — clear this device's cookies too, since
      // they're now pointing at dead tokens either way.
      console.warn(`Refresh token reuse detected for user ${uid}`);
      const response = NextResponse.json(
        { success: false, error: "reused" },
        { status: 401 },
      );
      clearSessionCookies(response);
      return response;
    }

    if (result.status !== "valid") {
      const response = NextResponse.json(
        { success: false, error: result.status },
        { status: 401 },
      );
      clearSessionCookies(response);
      return response;
    }

    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) {
      const response = NextResponse.json(
        { success: false, error: "invalid" },
        { status: 401 },
      );
      clearSessionCookies(response);
      return response;
    }

    // Rotates on every use — the old refresh token is marked (not
    // deleted), so a later replay of it is what reuse detection above
    // actually catches.
    const { token: newRefreshToken } = await rotateRefreshToken(
      uid,
      refreshToken,
    );
    const accessToken = signAccessToken({ sub: user.id });

    const response = NextResponse.json({ success: true }, { status: 200 });
    setSessionCookies(response, {
      accessToken,
      refreshToken: newRefreshToken,
      userId: user.id,
    });
    return response;
  } catch (err) {
    console.error("refresh-token error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
