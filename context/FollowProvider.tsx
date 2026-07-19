"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type FollowContextValue = {
  isFollowing: (username: string) => boolean;
  toggleFollow: (username: string) => void;
  followingCount: number;
  followingUsernames: string[];
};

const FollowContext = createContext<FollowContextValue | null>(null);

// Seeded so the following-only home feed isn't empty on first load — this
// stands in for "accounts this user already follows" until there's a
// real backend to source it from.
const INITIAL_FOLLOWING = [
  "glowbyash",
  "skinbytemi",
  "northofnorml",
  "grwmwithnaomi",
];

export function FollowProvider({ children }: { children: ReactNode }) {
  const [followed, setFollowed] = useState<Set<string>>(
    () => new Set(INITIAL_FOLLOWING),
  );

  function isFollowing(username: string) {
    return followed.has(username);
  }

  function toggleFollow(username: string) {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });
  }

  return (
    <FollowContext.Provider
      value={{
        isFollowing,
        toggleFollow,
        followingCount: followed.size,
        followingUsernames: Array.from(followed),
      }}
    >
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const ctx = useContext(FollowContext);
  if (!ctx) {
    throw new Error("useFollow must be used within a FollowProvider");
  }
  return ctx;
}
