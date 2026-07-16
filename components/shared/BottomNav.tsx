"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  BookmarkSimpleIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { PATHS } from "@/utils/paths";

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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-14 pb-[env(safe-area-inset-bottom)] items-stretch border-t border-gray-200 bg-white"
      aria-label="Primary"
    >
      {tabs.map(({ id, label, href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={id}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-1 items-center justify-center transition-transform duration-100 active:scale-90"
          >
            <Icon
              className="size-6 sm:size-6.5"
              weight={
                isActive ? (id != "explore" ? "fill" : "bold") : "regular"
              }
            />
          </Link>
        );
      })}
    </nav>
  );
}
