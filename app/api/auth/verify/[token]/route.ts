import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkMagicLinkToken,
  consumeMagicLinkToken,
  signAccessToken,
  createRefreshTokenForUser,
} from "@/lib/auth";
import { setSessionCookies } from "@/lib/authCookies";

type Props = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { token } = await params;

    const result = await checkMagicLinkToken(token);

    if (result.status !== "success") {
      // "expired" / "invalid" — matches the two failure states the
      // frontend's VerifyContent already renders, so no frontend change
      // is needed to understand this response shape.
      return NextResponse.json(
        { success: false, error: result.status },
        { status: 401 },
      );
    }

    // Consumed BEFORE issuing the session — a token can only ever be
    // redeemed once, even if something below throws afterward.
    await consumeMagicLinkToken(token);

    const user = await prisma.user.findUnique({
      where: { id: result.userId },
    });

    if (!user) {
      // Shouldn't happen in practice — the token's user was deleted
      // out from under it between the check above and this lookup.
      return NextResponse.json(
        { success: false, error: "invalid" },
        { status: 401 },
      );
    }

    const accessToken = signAccessToken({ sub: user.id });
    const { token: refreshToken } = await createRefreshTokenForUser(user.id);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarSrc: user.avatarSrc,
        },
        // Tells the frontend definitively whether to route through
        // onboarding — replaces the mock version's "always onboarding
        // unless a redirect is remembered" guesswork with a real answer.
        needsOnboarding: user.onboardingCompletedAt === null,
      },
      { status: 200 },
    );

    setSessionCookies(response, {
      accessToken,
      refreshToken,
      userId: user.id,
    });

    return response;
  } catch (err) {
    console.error("verify-token error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
