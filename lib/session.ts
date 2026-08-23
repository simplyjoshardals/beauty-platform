import { headers } from "next/headers";
import { prisma } from "./prisma";

// Identity now comes from proxy.ts, which runs before every request —
// page or API — verifies the access token, or silently refreshes it via
// the refresh token if it's expired, and forwards the result as
// x-user-id. Reading that header here (instead of re-verifying the raw
// accessToken cookie the way this used to) is what lets a Server
// Component see an already-refreshed session, since middleware can set
// a new cookie during the request and this can't.
export async function getServerUserId(): Promise<string | null> {
  return (await headers()).get("x-user-id");
}

// Minimal, fast read used ONLY to paint the bottom nav's profile tab
// correctly on first server render, so it doesn't flash from the
// generic icon to the real avatar after a refresh.
export async function getServerNavUser(): Promise<{
  avatarSrc: string;
} | null> {
  const userId = await getServerUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarSrc: true },
  });
  return user ?? null;
}
