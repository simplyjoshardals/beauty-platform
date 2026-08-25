"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useExplorePosts } from "@/hooks/useExplorePosts";
import { useExploreUserSearch } from "@/hooks/useExploreUserSearch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PostGrid } from "@/components/profile/PostGrid";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { UserListSkeleton } from "@/components/profile/UserListSkeleton";
import { UserListRow } from "@/components/profile/UserListRow";

// Same debounce window UserListWithSearch uses for Followers/Following —
// kept consistent so search doesn't feel instant here and delayed
// everywhere else.
const SEARCH_DEBOUNCE_MS = 300;

// Rendered inside a HydrationBoundary by app/explore/page.tsx, which has
// already prefetched EXPLORE_QUERY_KEY server-side — on a fresh load
// useExplorePosts's isLoading is false immediately, so the grid skeleton
// below is a real fallback for later client-side refetches, not the
// first paint.
//
// Search-by-people now round-trips to GET /api/explore/users (see
// useExploreUserSearch) instead of filtering MOCK_USERS client-side —
// same server-search shape as UserListWithSearch: this component just
// debounces keystrokes and hands the settled query to the hook, which
// owns the actual query/loading state.
export function ExploreFeed() {
  const { posts, isLoading } = useExplorePosts();
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const { users: matchedUsers, isLoading: searching } =
    useExploreUserSearch(debouncedQuery);

  const isSearching = query.trim().length > 0;
  // Once the visitor has typed something, gate on the debounced query
  // (not the raw one) too, so there's no flash of "no results" in the
  // gap between a keystroke and the debounce actually settling.
  const hasDebouncedQuery = debouncedQuery.trim().length > 0;

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
        !hasDebouncedQuery || searching ? (
          <UserListSkeleton />
        ) : matchedUsers.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-foreground/50">
            No results for &ldquo;{query}&rdquo;
          </p>
        ) : (
          matchedUsers.map((user) => (
            <UserListRow
              key={user.username}
              user={user}
              initialFollowing={user.isFollowing}
              initialFollowsMe={user.followsMe}
            />
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
