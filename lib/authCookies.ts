import { NextResponse } from "next/server";
import { REFRESH_TOKEN_EXPIRES_DAYS } from "@/constants/auth-constants";

// ACCESS_TOKEN_EXPIRES_IN is "15m" as a JWT expiry string, but the
// original boilerplate's login route separately hardcoded the cookie's
// own Max-Age to 5 minutes — a real mismatch: the cookie would vanish
// from the browser 10 minutes before the JWT inside it actually expired,
// silently forcing an early refresh every time. This constant is what
// the cookie's Max-Age is actually built from now, kept in seconds and
// deliberately matching the token's real lifetime.
const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
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
