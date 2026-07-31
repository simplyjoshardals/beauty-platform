import { NextResponse } from "next/server";
import {
  REFRESH_TOKEN_EXPIRES_DAYS,
  ACCESS_TOKEN_EXPIRES_SECONDS,
} from "@/constants/auth-constants";

// Cookie Max-Age is now built from the exact same constant the JWT
// itself is signed with (lib/auth.ts) — previously these were two
// separate literals ("15m" string vs. a hardcoded 15*60) that only
// happened to agree. The original boilerplate's login route had these
// drift apart entirely (JWT: 15m, cookie: 5m), causing the cookie to
// vanish from the browser 10 minutes before the token inside it actually
// expired. One shared number makes that class of bug structurally
// impossible to reintroduce.
const ACCESS_TOKEN_MAX_AGE_SECONDS = ACCESS_TOKEN_EXPIRES_SECONDS;
const REFRESH_TOKEN_MAX_AGE_SECONDS = REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60;

function buildCookie(name: string, value: string, maxAgeSeconds: number) {
  return [
    `${name}=${value}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Strict`,
    process.env.NODE_ENV === "production" ? "Secure" : "",
    `Max-Age=${maxAgeSeconds}`,
  ]
    .filter(Boolean)
    .join("; ");
}

// Sets all three session cookies at once — used identically after
// verifying a magic link and after refreshing a session, so the actual
// cookie-building logic only needs to exist (and be kept consistent) in
// one place, instead of copy-pasted at every call site.
export function setSessionCookies(
  response: NextResponse,
  opts: { accessToken: string; refreshToken: string; userId: string },
) {
  response.headers.append(
    "Set-Cookie",
    buildCookie("accessToken", opts.accessToken, ACCESS_TOKEN_MAX_AGE_SECONDS),
  );
  response.headers.append(
    "Set-Cookie",
    buildCookie(
      "refreshToken",
      opts.refreshToken,
      REFRESH_TOKEN_MAX_AGE_SECONDS,
    ),
  );
  response.headers.append(
    "Set-Cookie",
    buildCookie("uid", opts.userId, REFRESH_TOKEN_MAX_AGE_SECONDS),
  );
}

// Used by logout — Max-Age=0 tells the browser to delete each cookie
// immediately.
export function clearSessionCookies(response: NextResponse) {
  for (const name of ["accessToken", "refreshToken", "uid"]) {
    response.headers.append("Set-Cookie", buildCookie(name, "", 0));
  }
}
