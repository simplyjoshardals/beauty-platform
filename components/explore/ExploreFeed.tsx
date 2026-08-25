"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useExplorePosts } from "@/hooks/useExplorePosts";
import { MOCK_USERS } from "@/data/mockUsers";
import { PostGrid } from "@/components/profile/PostGrid";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { UserListSkeleton } from "@/components/profile/UserListSkeleton";
import { UserListRow } from "@/components/profile/UserListRow";

// Same debounced-search pattern as UserListWithSearch, kept consistent
// rather than having search feel instant here and delayed everywhere else.
// Search-by-people is still mock-backed for now (MOCK_USERS) — a real
// dedicated search endpoint is a later pass, not part of this one.
const SEARCH_DELAY_MS = 500;

// Rendered inside a HydrationBoundary by app/explore/page.tsx, which has
// already prefetched EXPLORE_QUERY_KEY server-side — on a fresh load
// useExplorePosts's isLoading is false immediately, so the grid skeleton
// below is a real fallback for later client-side refetches, not the
// first paint.
export function ExploreFeed() {
  const { posts, isLoading } = useExplorePosts();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const isFirstRender = useRef(true);

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

  const trimmed = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;
  const matchedUsers = isSearching
    ? MOCK_USERS.filter((u) => u.username.toLowerCase().includes(trimmed))
    : [];

  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground/10 px-4 py-2.5">
        <div className="flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-2">
          <MagnifyingGlassIcon size={16} className="text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/40"
          />
        </div>
      </div>

      {isSearching ? (
        searching ? (
          <UserListSkeleton />
        ) : matchedUsers.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-foreground/50">
            No results for &ldquo;{query}&rdquo;
          </p>
        ) : (
          matchedUsers.map((user) => (
            <UserListRow key={user.username} user={user} />
          ))
        )
      ) : isLoading ? (
        <PostGridSkeleton />
      ) : (
        <PostGrid
          posts={posts}
          emptyTitle="Nothing to explore yet"
          emptyDescription="New posts from the community will show up here."
        />
      )}
    </div>
  );
}
