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

// Builds a NextResponse.next() that actually forwards a header to the
// downstream Route Handler's req.headers — just calling
// NextResponse.next().headers.set(...) does NOT do this; it only sets a
// header on the response sent back to the browser. This is the pattern
// that's actually required for the route handler to see it.
function nextWithRequestHeader(req: NextRequest, name: string, value: string) {
  const headers = new Headers(req.headers);
  headers.set(name, value);
  return NextResponse.next({ request: { headers } });
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const userAgent = req.headers.get("user-agent") || "";
  if (isBot(userAgent)) {
    return addSecurityHeaders(
      new NextResponse("Access Denied", { status: 403 }),
    );
  }

  // Vanity-specific protected API routes. Deliberately short — the
  // shared boilerplate's deposits/withdrawals/admin/support routes
  // belonged to a different app entirely and weren't carried over. Add
  // to this list as real feature API routes (posts, comments, follow,
  // saved, notifications) get built.
  const isProtectedRoute = ["/api/user"].some((route) =>
    pathname.startsWith(route),
  );

  if (!isProtectedRoute) {
    return addSecurityHeaders(NextResponse.next());
  }

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const uid = req.cookies.get("uid")?.value;

  // Try access token first
  if (accessToken) {
    try {
      const payload = verifyAccessToken(accessToken);
      const res = nextWithRequestHeader(
        req,
        "x-user-id",
        (payload as { sub: string }).sub,
      );
      // No x-user-role header — the schema has no `role` concept.
      // Add one back here (and to User) if/when an admin tier exists.
      return addSecurityHeaders(res);
    } catch {
      // Access token invalid/expired, fall through to refresh
    }
  }

  // Try refresh token if access token failed — a lightweight, silent
  // reissue only. This does NOT rotate the refresh token itself; that
  // heavier operation is reserved for the explicit /api/auth/refresh-
  // token route, so a refresh token isn't rotated on every request. It
  // still needs to check for reuse, though — a stolen/stale token being
  // replayed is exactly as dangerous here as it is on the dedicated
  // refresh route.
  if (refreshToken && uid) {
    try {
      const result = await checkRefreshToken(uid, refreshToken);

      if (result.status === "reused") {
        console.warn(`Refresh token reuse detected for user ${uid}`);
        const res = addSecurityHeaders(
          NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 },
          ),
        );
        // Every session for this user was already revoked inside
        // checkRefreshToken — clear this device's cookies too, since
        // they're now pointing at dead tokens either way.
        for (const name of ["accessToken", "refreshToken", "uid"]) {
          res.headers.append(
            "Set-Cookie",
            `${name}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
          );
        }
        return res;
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

  // Both tokens invalid or missing
  return addSecurityHeaders(
    NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    ),
  );
}

export const config = {
  matcher: [
    "/api/user/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
