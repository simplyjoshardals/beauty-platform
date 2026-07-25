"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { usePosts } from "@/context/PostsProvider";
import { CURRENT_USER } from "@/constants/currentUser";
import { MOCK_USERS } from "@/data/mockUsers";
import { PostGrid } from "@/components/profile/PostGrid";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { UserListSkeleton } from "@/components/profile/UserListSkeleton";
import { UserListRow } from "@/components/profile/UserListRow";
import { RequireAuth } from "@/components/auth/RequireAuth";

// Simulated so the skeleton is actually visible — swap for a real pending
// flag once this comes from a real fetch.
const SIMULATED_LOAD_MS = 900;

// Same debounced-search pattern as UserListWithSearch, kept consistent
// rather than having search feel instant here and delayed everywhere else.
const SEARCH_DELAY_MS = 500;

export default function ExplorePage() {
  const { posts } = usePosts();
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

  const trimmed = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;
  const matchedUsers = isSearching
    ? MOCK_USERS.filter((u) => u.username.toLowerCase().includes(trimmed))
    : [];

  // Explore is for discovering accounts you don't already see everywhere
  // else — your own posts already show on your profile and in Home, so
  // they're excluded here rather than cluttering the discovery grid.
  const discoverPosts = posts.filter(
    (post) => post.author.username !== CURRENT_USER.username,
  );

  return (
    <RequireAuth>
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

        {loading ? (
          <PostGridSkeleton />
        ) : isSearching ? (
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
        ) : (
          <PostGrid
            posts={discoverPosts}
            emptyTitle="Nothing to explore yet"
            emptyDescription="New posts from the community will show up here."
          />
        )}
      </div>
    </RequireAuth>
  );
}
