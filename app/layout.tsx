import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import "./globals.css";
import { BottomNav } from "@/components/shared/BottomNav";
import { TopNav } from "@/components/shared/TopNav";
import { Providers } from "./providers";
import { getServerUserId } from "@/lib/session";
import { fetchCurrentUserForSSR } from "@/lib/serverQueries";
import { CURRENT_USER_QUERY_KEY } from "@/lib/queryKeys";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Vanity",
    template: "%s | Vanity",
  },

  description:
    "A beauty-focused social platform to share looks, tag products, pin your routine, and follow the creators you love.",

  applicationName: "Vanity",

  keywords: [
    "Vanity",
    "beauty social platform",
    "beauty app",
    "skincare routine",
    "makeup routine",
    "before and after",
    "product tagging",
    "Next.js",
    "social media app",
  ],

  openGraph: {
    title: "Vanity",
    description:
      "A beauty-focused social platform to share looks, tag products, pin your routine, and follow the creators you love.",
    url: "https://beauty-platform-ivory.vercel.app",
    siteName: "Vanity",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vanity",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Deliberately fixed, not theme-dependent: iOS reads this (and the
  // meta tag it renders as) to color the status bar/browser chrome, and
  // toggling it to black in dark mode looked like the OS switching
  // color schemes out from under you rather than just the app's own
  // content re-theming. Stays white in both light and dark mode now —
  // see TopNav's applyTheme, which no longer touches this tag either.
  themeColor: "#ffffff",
};

// Runs synchronously in <head>, before first paint — a plain <script>
// (not <template>, which is inert and never executes its content) is
// what makes that possible. This is what actually prevents a flash of
// the wrong theme for someone who's explicitly overridden it in-app
// (localStorage) against their OS preference; @media (prefers-color-
// scheme) in globals.css already covers the "never touched the toggle"
// case via pure CSS, with no JS involved at all.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.add(dark ? "dark" : "light");
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getServerUserId();
  const currentUser = userId ? await fetchCurrentUserForSSR(userId) : null;

  // Prefetched here — not just on the Home page — because BottomNav
  // (and anything else that calls useCurrentUser() outside a page's own
  // HydrationBoundary) lives in this layout and renders on every route.
  // A page-level prefetch only ever covered that one page's tree; this
  // covers the shared chrome too, on Explore/Saved/Profile/etc as well.
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => currentUser,
  });

  const navUser = currentUser ? { avatarSrc: currentUser.avatarSrc } : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <TopNav />
            <main className="mx-auto w-full max-w-lg flex-1 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
              {children}
            </main>
            <BottomNav initialUser={navUser} />
          </HydrationBoundary>
        </Providers>
      </body>
    </html>
  );
}
