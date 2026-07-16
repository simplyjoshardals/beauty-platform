"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookmarkSimpleIcon,
  HouseIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";

const tabs = [
  { id: "home", label: "Home", href: "/", icon: HouseIcon },
  { id: "search", label: "Search", href: "/search", icon: MagnifyingGlassIcon },
  { id: "saved", label: "Saved", href: "/saved", icon: BookmarkSimpleIcon },
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
              size={26}
              weight={isActive ? (id != "search" ? "fill" : "bold") : "regular"}
              color="#000000"
            />
          </Link>
        );
      })}
    </nav>
  );
}
