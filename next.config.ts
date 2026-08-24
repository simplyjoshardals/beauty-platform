import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    // Dynamic routes (anything touching cookies()/headers() — which is
    // every route now, via the layout's getServerUserId() call) default
    // to a 0s client cache: every nav re-runs the full server render.
    // This gives a short reuse window instead, so tapping back to a
    // page you just left (e.g. Home via the bottom nav) is instant
    // rather than a full round trip. Data can be up to this many
    // seconds stale on a quick revisit — fine for a feed; call
    // router.refresh() after mutations (new post, etc.) if you need to
    // force a fresh render regardless of this window.
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
