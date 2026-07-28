import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { prisma } from "./prisma";
import {
  MAGIC_LINK_EXPIRES_MS,
  REFRESH_TOKEN_EXPIRES_DAYS,
} from "@/constants/auth-constants";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set in env");

export const ACCESS_TOKEN_EXPIRES_IN = "15m";

// ---------------------------------------------------------------------
// Access tokens — unchanged from the password-based version. Whether
// someone authenticated with a password or a magic link has no bearing
// on how the SESSION itself works once they're in.
// ---------------------------------------------------------------------
export function signAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

// ---------------------------------------------------------------------
// Refresh tokens — same shape as before, just backed by the RefreshToken
// model added to the schema for this (it didn't exist until now).
// ---------------------------------------------------------------------
export async function createRefreshTokenForUser(userId: string) {
  const token = nanoid(48);
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return { token, expiresAt };
}

export async function rotateRefreshToken(userId: string, oldToken: string) {
  // Marked as rotated, not deleted — the row needs to survive so a
  // later reuse attempt on this exact token can actually be detected.
  await prisma.refreshToken.updateMany({
    where: { token: oldToken, userId },
    data: { rotatedAt: new Date() },
  });
  return createRefreshTokenForUser(userId);
}

export type RefreshTokenCheckResult =
  | { status: "valid" }
  | { status: "expired" }
  | { status: "reused" }
  | { status: "invalid" };

// Replaces the old boolean verifyRefreshToken. A plain true/false can't
// distinguish "this token is garbage" from "this token was real but
// already used to rotate once" — and that second case is exactly the
// theft signal worth reacting to differently: if it fires, every
// session for this user gets revoked immediately, not just this request.
export async function checkRefreshToken(
  userId: string,
  token: string,
): Promise<RefreshTokenCheckResult> {
  const record = await prisma.refreshToken.findUnique({ where: { token } });

  if (!record || record.userId !== userId) {
    return { status: "invalid" };
  }

  if (record.rotatedAt) {
    // Someone is replaying a refresh token that's already been rotated
    // away — the legitimate device already moved on to a newer one, so
    // this copy can only be a stale/stolen one. Kill every session for
    // this user; whoever's actually them just signs in again via a
    // fresh magic link.
    await revokeAllRefreshTokens(userId);
    return { status: "reused" };
  }

  if (record.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: record.id } });
    return { status: "expired" };
  }

  return { status: "valid" };
}

export async function revokeAllRefreshTokens(userId: string) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

// Run periodically (a cron job, not per-request). Purges truly expired
// tokens, plus rotated tokens past a retention window — rotated tokens
// aren't deleted immediately anymore (see rotateRefreshToken), so
// something needs to eventually clean them up once they're no longer
// useful for reuse detection.
const ROTATED_TOKEN_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function cleanupExpiredTokens() {
  await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        {
          rotatedAt: {
            not: null,
            lt: new Date(Date.now() - ROTATED_TOKEN_RETENTION_MS),
          },
        },
      ],
    },
  });
}

// ---------------------------------------------------------------------
// Magic link tokens — the actual auth mechanism, replacing
// hashPassword/comparePassword entirely. No passwords exist in this app
// at all, so there's nothing to hash or compare.
// ---------------------------------------------------------------------

// Deletes any previous unused tokens for this user before issuing a new
// one — same "delete old tokens" pattern the old verification-token flow
// used, so a user can never have more than one valid link outstanding.
export async function createMagicLinkToken(userId: string) {
  await prisma.magicLinkToken.deleteMany({ where: { userId } });

  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRES_MS);

  await prisma.magicLinkToken.create({
    data: { token, userId, expiresAt },
  });

  return { token, expiresAt };
}

export type MagicLinkVerifyResult =
  | { status: "success"; userId: string }
  | { status: "expired" }
  | { status: "invalid" };

// Validates a token WITHOUT consuming it — used by the verify route,
// which needs to check validity before deciding whether to actually mark
// it used and issue a session.
export async function checkMagicLinkToken(
  token: string,
): Promise<MagicLinkVerifyResult> {
  const record = await prisma.magicLinkToken.findUnique({ where: { token } });

  if (!record || record.usedAt) return { status: "invalid" };
  if (record.expiresAt < new Date()) return { status: "expired" };

  return { status: "success", userId: record.userId };
}

export async function consumeMagicLinkToken(token: string) {
  await prisma.magicLinkToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });
}
