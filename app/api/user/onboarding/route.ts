import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { USERNAME_PATTERN, USERNAME_FORMAT_ERROR } from "@/constants/username";

// x-user-id is set by proxy.ts, which already validated the session
// before this route runs — same pattern as /api/user/me.
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { username, avatarSrc, toneTag, bio } = await req.json();

    // Only accepts a URL that actually came from OUR Cloudinary account,
    // in the avatars folder specifically — not just "any https URL." A
    // real upload always goes through /api/upload/signature first, so
    // this is what stops someone from bypassing that flow entirely and
    // just submitting an arbitrary external image URL as their avatar.
    const isValidAvatarSrc =
      typeof avatarSrc === "string" &&
      avatarSrc.includes(
        `res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
      ) &&
      avatarSrc.includes("/vanity/avatars/");

    if (
      typeof username !== "string" ||
      !USERNAME_PATTERN.test(username.trim().toLowerCase())
    ) {
      return NextResponse.json(
        {
          success: false,
          error: USERNAME_FORMAT_ERROR,
        },
        { status: 400 },
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existing && existing.id !== userId) {
      return NextResponse.json(
        { success: false, error: "That username is already taken." },
        { status: 409 },
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        username: normalizedUsername,
        ...(isValidAvatarSrc ? { avatarSrc } : {}),
        ...(typeof toneTag === "string" ? { toneTag } : {}),
        ...(typeof bio === "string" ? { bio } : {}),
        onboardingCompletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarSrc: user.avatarSrc,
        bio: user.bio,
        toneTag: user.toneTag,
        onboardingCompletedAt: user.onboardingCompletedAt,
      },
    });
  } catch (err) {
    console.error("onboarding error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
