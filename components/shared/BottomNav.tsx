"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  BookmarkSimpleIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { PATHS } from "@/utils/paths";
import { useNotifications } from "@/context/NotificationsProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProfile } from "@/context/ProfileProvider";

const tabs = [
  { id: "home", label: "Home", href: PATHS.HOME, icon: HouseIcon },
  {
    id: "explore",
    label: "Explore",
    href: PATHS.EXPLORE,
    icon: MagnifyingGlassIcon,
  },
  { id: "saved", label: "Saved", href: PATHS.SAVED, icon: BookmarkSimpleIcon },
  {
    id: "notifications",
    label: "Notifications",
    href: PATHS.NOTIFICATIONS,
    icon: BellIcon,
  },
  {
    id: "profile",
    label: "Profile",
    href: PATHS.PROFILE,
    icon: UserIcon,
  },
] as const;

// Exact match for Home only — "/" is technically a prefix of every route,
// so without this special case Home would light up on every page. Every
// other tab treats its own subroutes (e.g. /profile/followers) as still
// "under" it, so the tab stays active while navigating deeper.
function isTabActive(pathname: string, href: string) {
  if (href === PATHS.HOME) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const { isAuthenticated } = useCurrentUser();
  const { profile } = useProfile();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 flex h-14 pb-[env(safe-area-inset-bottom)] items-stretch border-t border-foreground/10 bg-background"
      aria-label="Primary"
    >
      {tabs.map(({ id, label, href, icon: Icon }) => {
        const isActive = isTabActive(pathname, href);
        // Real session, real avatar to show — falls back to the generic
        // icon when nobody's actually signed in (useCurrentUser's
        // isAuthenticated reflects a real /api/user/me check, not a
        // client-only flag).
        const showAvatar = id === "profile" && isAuthenticated;

        return (
          <Link
            key={id}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-1 items-center justify-center transition-transform duration-100 active:scale-90"
          >
            <span className="relative inline-flex">
              {showAvatar ? (
                <span
                  className={`block size-6 overflow-hidden rounded-full ring-1 ring-foreground/15 sm:size-6.5 ${
                    isActive ? "ring-2 ring-foreground" : ""
                  }`}
                >
                  <Image
                    src={profile.avatarSrc}
                    alt=""
                    width={26}
                    height={26}
                    unoptimized
                    className="size-full object-cover"
                  />
                </span>
              ) : (
                <Icon
                  className="size-6 sm:size-6.5"
                  weight={
                    isActive ? (id != "explore" ? "fill" : "bold") : "regular"
                  }
                />
              )}
              {id === "notifications" && unreadCount > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red-500 ring-2 ring-background"
                  aria-hidden
                />
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
