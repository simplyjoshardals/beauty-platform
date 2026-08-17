"use client";

import { useEffect, useState } from "react";

// Generic — not username-specific. Returns `value`, but only after it's
// stopped changing for `delayMs`, so callers (like a live availability
// check) aren't firing a network request on every single keystroke.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
