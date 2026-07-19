"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { UserListRow } from "./UserListRow";
import { UserListSkeleton } from "./UserListSkeleton";
import type { MockUser } from "@/data/mockUsers";

type Props = {
  users: MockUser[];
  emptyLabel: string; // shown when the list itself has nobody in it at all
};

// Simulated so the skeleton is actually visible — swap for a real pending
// flag once these lists come from a real fetch. Runs once per mount, which
// is fine here since Followers/Following are separate pages that fully
// unmount on navigation, unlike CommentSheet which stays mounted.
const SIMULATED_LOAD_MS = 700;

// Debounce + simulated per-search delay — stands in for a real search API
// round trip. Resets on every keystroke so rapid typing just keeps the
// skeleton up until typing actually pauses, instead of flashing per letter.
const SEARCH_DELAY_MS = 500;

export function UserListWithSearch({ users, emptyLabel }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), SIMULATED_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Skipped on mount — only real query changes (typing, clearing) should
  // trigger the search skeleton, not the initial empty query.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(() => setSearching(false), SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  if (loading) {
    return <UserListSkeleton />;
  }

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? users.filter((u) => u.username.toLowerCase().includes(trimmed))
    : users;

  return (
    <>
      <div className="border-b border-foreground/10 px-4 py-2.5">
        <div className="flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-2">
          <MagnifyingGlassIcon size={16} className="text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/40"
          />
        </div>
      </div>

      {searching ? (
        <UserListSkeleton />
      ) : users.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-foreground/50">
          {emptyLabel}
        </p>
      ) : filtered.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-foreground/50">
          No results for &ldquo;{query}&rdquo;
        </p>
      ) : (
        filtered.map((user) => <UserListRow key={user.username} user={user} />)
      )}
    </>
  );
}
