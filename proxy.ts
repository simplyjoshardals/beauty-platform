import { NextRequest, NextResponse } from "next/server";
import {
  verifyAccessToken,
  checkRefreshToken,
  signAccessToken,
} from "./lib/auth";
import { prisma } from "./lib/prisma";

function addSecurityHeaders(response: NextResponse) {
  response.headers.set(
    "X-Robots-Tag",
    "noindex, nofollow, noarchive, nosnippet",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Permissions-Policy", "interest-cohort=()");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

function isBot(userAgent: string): boolean {
  const botPatterns = [
    "googlebot",
    "bingbot",
    "slurp",
    "duckduckbot",
    "baiduspider",
    "yandexbot",
    "crawler",
    "spider",
    "scraper",
    "bot",
    "archive.org",
    "wayback",
    "ia_archiver",
    "gptbot",
    "chatgpt",
    "ccbot",
    "anthropic",
    "claude",
    "cohere",
  ];
  const lowerUA = userAgent.toLowerCase();
  return botPatterns.some((pattern) => lowerUA.includes(pattern));
}

function nextWithRequestHeader(req: NextRequest, name: string, value: string) {
  const headers = new Headers(req.headers);
  headers.set(name, value);
  return NextResponse.next({ request: { headers } });
}

// Clears the three auth cookies on whatever response we're already
// returning — shared by the refresh-token-reuse branch below, since
// that's now reachable from both page requests and API requests.
function clearAuthCookies(res: NextResponse) {
  for (const name of ["accessToken", "refreshToken", "uid"]) {
    res.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
    );
  }
  return res;
}

const RESERVED_POST_SEGMENTS = new Set(["likes"]);

function isPublicPostGet(pathname: string, method: string): boolean {
  if (method !== "GET") return false;
  const match = pathname.match(/^\/api\/posts\/([^/]+)(?:\/comments)?$/);
  if (!match) return false;
  const [, postId] = match;
  return !RESERVED_POST_SEGMENTS.has(postId);
}

const RESERVED_USER_SEGMENTS = new Set([
  "me",
  "onboarding",
  "username-available",
]);

function isPublicUserGet(pathname: string, method: string): boolean {
  if (method !== "GET") return false;
  const match = pathname.match(/^\/api\/user\/([^/]+)(?:\/posts)?$/);
  if (!match) return false;
  const [, username] = match;
  return !RESERVED_USER_SEGMENTS.has(username);
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const userAgent = req.headers.get("user-agent") || "";
  if (isBot(userAgent)) {
    return addSecurityHeaders(
      new NextResponse("Access Denied", { status: 403 }),
    );
  }

  // Vanity-specific protected API routes — same list as before. The
  // difference from before: this no longer gates whether we ATTEMPT to
  // identify the caller (that now happens unconditionally below, for
  // every request, page or API) — it only gates whether a failed
  // identification is a hard 401 or a quiet pass-through. A page
  // request with no valid session isn't an error; RequireAuth decides
  // what to do with that on the frontend, same as always.
  const isProtectedRoute = [
    "/api/user",
    "/api/upload",
    "/api/posts",
    "/api/saved",
    "/api/explore",
    "/api/notifications",
  ].some((route) => pathname.startsWith(route));

  const isPublicGet =
    isPublicPostGet(pathname, req.method) ||
    isPublicUserGet(pathname, req.method);

  // Only these two cases still enforce a hard 401 when identification
  // fails below — every other route (pages, /api/auth/*, the public
  // GET exceptions) falls through to an anonymous NextResponse.next()
  // instead.
  const enforceAuth = isProtectedRoute && !isPublicGet;

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const uid = req.cookies.get("uid")?.value;

  // Try access token first. Runs for every request now — not just
  // protected API routes — so a Server Component can read x-user-id
  // via lib/session.ts instead of re-verifying the raw cookie itself
  // (which can't recover an expired token during render; middleware,
  // running before the Server Component, can).
  if (accessToken) {
    try {
      const payload = verifyAccessToken(accessToken);
      const res = nextWithRequestHeader(
        req,
        "x-user-id",
        (payload as { sub: string }).sub,
      );
      return addSecurityHeaders(res);
    } catch {
      // Access token invalid/expired, fall through to refresh
    }
  }

  // Try refresh token if access token failed — lightweight, silent
  // reissue only, same as before. Doesn't rotate the refresh token
  // itself; that's still reserved for the explicit
  // /api/auth/refresh-token route.
  if (refreshToken && uid) {
    try {
      const result = await checkRefreshToken(uid, refreshToken);

      if (result.status === "reused") {
        console.warn(`Refresh token reuse detected for user ${uid}`);
        if (enforceAuth) {
          const res = clearAuthCookies(
            addSecurityHeaders(
              NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
              ),
            ),
          );
          return res;
        }
        // Page request (or public GET) — a raw JSON 401 body would
        // render as the page itself, which is wrong. Clear the
        // compromised cookies and let it through anonymously instead;
        // RequireAuth (or the public page) handles a logged-out visit
        // the normal way from there.
        return addSecurityHeaders(clearAuthCookies(NextResponse.next()));
      }

      if (result.status === "valid") {
        const user = await prisma.user.findUnique({
          where: { id: uid },
          select: { id: true },
        });

        if (user) {
          const newAccessToken = signAccessToken({ sub: user.id });
          const res = nextWithRequestHeader(req, "x-user-id", user.id);

          const cookieAccess = [
            `accessToken=${newAccessToken}`,
            `Path=/`,
            `HttpOnly`,
            `SameSite=Strict`,
            process.env.NODE_ENV === "production" ? "Secure" : "",
            `Max-Age=${60 * 15}`,
          ]
            .filter(Boolean)
            .join("; ");

          res.headers.append("Set-Cookie", cookieAccess);
          return addSecurityHeaders(res);
        }
      }
    } catch (err) {
      console.error("proxy refresh error:", err);
    }
  }

  // Neither token worked. Hard 401 only for the routes that actually
  // require a session; every page request and every already-public GET
  // just passes through with no x-user-id — an ordinary anonymous
  // visit, not an error.
  if (enforceAuth) {
    return addSecurityHeaders(
      NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      ),
    );
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/api/user/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
