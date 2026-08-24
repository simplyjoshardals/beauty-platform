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
import { FollowProvider } from "@/context/FollowProvider";
import { NotificationsProvider } from "@/context/NotificationsProvider";
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
  title: "Vanity",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Static fallback for first paint — the actual light/dark value is set
  // dynamically below and in TopNav's applyTheme, since prefers-color-scheme
  // media queries can't react to the manually-toggled .dark/.light class.
  themeColor: "#ffffff",
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.add(dark ? "dark" : "light");

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", dark ? "#000000" : "#ffffff");
    }
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
        <template dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <FollowProvider>
              <NotificationsProvider>
                <TopNav />
                <main className="mx-auto w-full max-w-lg flex-1 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
                  {children}
                </main>
                <BottomNav initialUser={navUser} />
              </NotificationsProvider>
            </FollowProvider>
          </HydrationBoundary>
        </Providers>
      </body>
    </html>
  );
}
