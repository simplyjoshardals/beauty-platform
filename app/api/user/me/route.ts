import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { USERNAME_PATTERN, USERNAME_FORMAT_ERROR } from "@/constants/username";

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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { routineItems: { orderBy: { order: "asc" } } },
  });

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
      bio: user.bio,
      toneTag: user.toneTag,
      // Shaped as ProductTag[] (id + label) — same shape the rest of the
      // frontend already expects for pinned routine / post product tags.
      pinnedRoutine: user.routineItems.map((item) => ({
        id: item.id,
        label: item.label,
      })),
      onboardingCompletedAt: user.onboardingCompletedAt,
    },
  });
}

// Own-profile edits (Edit Profile screen). Same trust model as GET and
// as /api/user/onboarding — proxy.ts has already validated the session,
// this route just trusts x-user-id. Every field is optional here (unlike
// onboarding's POST, which requires username): a PATCH only touches
// whatever the client actually sent.
export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { username, avatarSrc, toneTag, bio, pinnedRoutine } =
      await req.json();

    const data: {
      username?: string;
      avatarSrc?: string;
      toneTag?: string;
      bio?: string;
    } = {};

    if (username !== undefined) {
      if (
        typeof username !== "string" ||
        !USERNAME_PATTERN.test(username.trim().toLowerCase())
      ) {
        return NextResponse.json(
          { success: false, error: USERNAME_FORMAT_ERROR },
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

      data.username = normalizedUsername;
    }

    // Same guard as onboarding: only ever a URL that actually came from
    // our own Cloudinary avatars folder, via /api/upload/signature —
    // never an arbitrary external URL submitted directly.
    if (avatarSrc !== undefined) {
      const isValidAvatarSrc =
        typeof avatarSrc === "string" &&
        avatarSrc.includes(
          `res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
        ) &&
        avatarSrc.includes("/vanity/avatars/");

      if (!isValidAvatarSrc) {
        return NextResponse.json(
          { success: false, error: "Invalid avatar image." },
          { status: 400 },
        );
      }

      data.avatarSrc = avatarSrc;
    }

    if (toneTag !== undefined) {
      if (typeof toneTag !== "string") {
        return NextResponse.json(
          { success: false, error: "Invalid tone tag." },
          { status: 400 },
        );
      }
      data.toneTag = toneTag;
    }

    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return NextResponse.json(
          { success: false, error: "Invalid bio." },
          { status: 400 },
        );
      }
      data.bio = bio;
    }

    // pinnedRoutine, if sent, is validated separately since it isn't a
    // plain scalar column — it's the RoutineItem rows, replaced wholesale
    // rather than diffed, same as how onboarding treats the rest of the
    // profile as "just overwrite it with what was submitted."
    let routineItemsInput: { label: string }[] | null = null;
    if (pinnedRoutine !== undefined) {
      if (
        !Array.isArray(pinnedRoutine) ||
        !pinnedRoutine.every(
          (item) =>
            item && typeof item === "object" && typeof item.label === "string",
        )
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid pinned routine." },
          { status: 400 },
        );
      }
      routineItemsInput = pinnedRoutine.map((item: { label: string }) => ({
        label: item.label,
      }));
    }

    const [user] = await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data }),
      ...(routineItemsInput
        ? [
            prisma.routineItem.deleteMany({ where: { userId } }),
            prisma.routineItem.createMany({
              data: routineItemsInput.map((item, index) => ({
                userId,
                label: item.label,
                order: index,
              })),
            }),
          ]
        : []),
    ]);

    const routineItems = await prisma.routineItem.findMany({
      where: { userId },
      orderBy: { order: "asc" },
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
        pinnedRoutine: routineItems.map((item) => ({
          id: item.id,
          label: item.label,
        })),
        onboardingCompletedAt: user.onboardingCompletedAt,
      },
    });
  } catch (err) {
    console.error("update profile error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
