"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlusIcon, SunIcon, MoonIcon } from "@phosphor-icons/react";
import { PATHS } from "@/utils/paths";

export  function TopNav() {
  const [isDark, setIsDark] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Resolve initial theme: saved preference wins, otherwise OS setting
  useEffect(() => {
    const stored = localStorage.getItem("theme"); // "dark" | "light" | null
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialDark = stored ? stored === "dark" : prefersDark;

    applyTheme(initialDark);
  }, []);

  // Hide on scroll down, reveal on scroll up — same pattern as Twitter/
  // Medium's header. rAF-throttled so this isn't recalculating on every
  // single scroll pixel, and a small delta threshold + "always visible
  // near the top" clamp avoid jitter from momentum/rubber-band scrolling.
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateVisibility() {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY < 64) {
        setHidden(false);
      } else if (Math.abs(delta) > 4) {
        setHidden(delta > 0);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    }

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function applyTheme(dark: boolean) {
    setIsDark(dark);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(dark ? "dark" : "light");

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", dark ? "#000000" : "#ffffff");
    }
  }

  function toggleTheme() {
    const next = !isDark;
    applyTheme(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <nav
      className={`fixed top-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 grid grid-cols-[1fr_auto_1fr] items-center h-14 pt-[env(safe-area-inset-top)] px-4 border-b border-foreground/10 bg-background transition-transform duration-300 ease-in-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
      aria-label="Top"
    >
      <div className="flex justify-start">
        <Link
          href={PATHS.CREATE_POST}
          aria-label="Create post"
          className="flex size-9 items-center justify-center text-foreground transition-transform duration-100 active:scale-90"
        >
          <PlusIcon className="size-6" weight="regular" />
        </Link>
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
