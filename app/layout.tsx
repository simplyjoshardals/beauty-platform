import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/shared/BottomNav";
import { TopNav } from "@/components/shared/TopNav";
import { FollowProvider } from "@/context/FollowProvider";
import { NotificationsProvider } from "@/context/NotificationsProvider";
import { Providers } from "./providers";
import { getServerNavUser } from "@/lib/session";

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
  const navUser = await getServerNavUser();

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
          <FollowProvider>
            <NotificationsProvider>
              <TopNav />
              <main className="mx-auto w-full max-w-lg flex-1 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
                {children}
              </main>
              <BottomNav initialUser={navUser} />
            </NotificationsProvider>
          </FollowProvider>
        </Providers>
      </body>
    </html>
  );
}
