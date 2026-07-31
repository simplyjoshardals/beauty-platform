import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMagicLinkToken } from "@/lib/auth";
import { RESEND_COOLDOWN_MS } from "@/constants/auth-constants";
import { PATHS } from "@/utils/paths";
import { emailTemplates } from "@/utils/emailTemplate";
import { sendSafeEmail } from "@/utils/sendSafeEmail";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Placeholder shape matches what utils/username.ts validates (3–20
// chars, lowercase letters/numbers/underscore/period) — onboarding's
// required first step always overwrites this before the account is used
// anywhere else in the app.
function generatePlaceholderUsername(): string {
  return `user_${Math.random().toString(36).slice(2, 10)}`;
}

// Single endpoint for signup, login, AND resend — a magic link makes all
// three the exact same action: find-or-create the account for this
// email, then send a fresh link. There's no separate register/login
// distinction anymore.
export async function POST(req: NextRequest) {
  try {
    const { email, redirectTo } = await req.json();

    if (!email || typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    // Only ever treat this as a same-app relative path — it arrives as
    // plain client input, so nothing stops someone from sending an
    // absolute external URL here otherwise.
    const safeRedirect =
      typeof redirectTo === "string" && redirectTo.startsWith("/")
        ? redirectTo
        : undefined;

    const normalizedEmail = email.trim().toLowerCase();

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          username: generatePlaceholderUsername(),
          avatarSrc: "/default-avatar.png",
        },
      });
    }

    // Resend cooldown, enforced server-side too — the frontend already
    // disables its own resend button for 30s, but that's UI politeness,
    // not security; a direct API call could otherwise bypass it entirely.
    const lastToken = await prisma.magicLinkToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (
      lastToken &&
      Date.now() - lastToken.createdAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please wait before requesting another link.",
        },
        { status: 429 },
      );
    }

    const { token } = await createMagicLinkToken(user.id);
    // PATHS.AUTH_VERIFY is the FRONTEND page route (already exists in
    // utils/paths.ts), not this API route — the emailed link needs to
    // open a page with a real UI (spinner, success/expired state), which
    // then calls this API's sibling verify endpoint itself. Confusing
    // API paths with frontend paths here would send people to a bare
    // JSON response instead of the actual verify screen.
    const redirectQuery = safeRedirect
      ? `?redirect=${encodeURIComponent(safeRedirect)}`
      : "";
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${PATHS.AUTH_VERIFY(token)}${redirectQuery}`;

    await sendSafeEmail(
      {
        to: user.email,
        from: "Vanity <noreply@cruizeeasy.com>",
        subject: "Your Vanity sign-in link",
        html: emailTemplates.magicLink(verifyUrl),
        text: `Sign in to Vanity: ${verifyUrl}\n\nThis link expires in 15 minutes.`,
      },
      "magic-link",
    );

    return NextResponse.json(
      { success: true, message: "Magic link sent." },
      { status: 200 },
    );
  } catch (err) {
    console.error("request-link error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
