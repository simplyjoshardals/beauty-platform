"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PlusIcon, SunIcon, MoonIcon } from "@phosphor-icons/react";

export default function TopNav() {
  const [isDark, setIsDark] = useState(false);

  // Resolve initial theme: saved preference wins, otherwise OS setting
  useEffect(() => {
    const stored = localStorage.getItem("theme"); // "dark" | "light" | null
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialDark = stored ? stored === "dark" : prefersDark;

    applyTheme(initialDark);
  }, []);

  function applyTheme(dark: boolean) {
    setIsDark(dark);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(dark ? "dark" : "light");
  }

  function toggleTheme() {
    const next = !isDark;
    applyTheme(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <nav
      className="fixed top-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 grid grid-cols-[1fr_auto_1fr] items-center h-14 pt-[env(safe-area-inset-top)] px-4 border-b border-foreground/10 bg-background"
      aria-label="Top"
    >
      <div className="flex justify-start">
        <button
          type="button"
          aria-label="Create post"
          className="flex size-9 items-center justify-center text-foreground transition-transform duration-100 active:scale-90"
        >
          <PlusIcon className="size-6" weight="regular" />
        </button>
      </div>

      <Image
        src={isDark ? "/wordmark-logo-dark.png" : "/wordmark-logo-light.png"}
        alt="wordmark-logo"
        width={100}
        height={50}
        className="justify-self-center"
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex size-9 items-center justify-center text-foreground transition-transform duration-100 active:scale-90"
        >
          {isDark ? (
            <SunIcon className="size-6" weight="regular" />
          ) : (
            <MoonIcon className="size-6" weight="regular" />
          )}
        </button>
      </div>
    </nav>
  );
}
