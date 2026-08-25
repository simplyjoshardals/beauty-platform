"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { UserListRow } from "./UserListRow";
import { UserListSkeleton } from "./UserListSkeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { FollowingUser } from "@/hooks/useFollowingList";

type Props = {
  // FollowingUser (MockUser + id + isFollowing/followsMe/isSelf) rather
  // than plain MockUser — both useFollowingList and useFollowersList now
  // return the viewer's relationship to each row, computed batched
  // server-side (see lib/users.ts's getFollowingList/getFollowersList),
  // same as Explore's search results. Passed straight through to
  // UserListRow below as initial state.
  users: FollowingUser[];
  emptyLabel: string; // shown when the list itself has nobody in it at all
  // Real backend loading state (from useFollowingList/useFollowersList) —
  // when supplied, this replaces the simulated timer below entirely
  // instead of racing it. Omitted (undefined) on any page that hasn't
  // been wired up to a real backend yet.
  isLoading?: boolean;
  // Search is server-side: `users` is assumed to already BE the server's
  // result set for the current debounced query (see useFollowersList's
  // `search` param / GET .../followers?search=). This component doesn't
  // filter `users` itself — it just debounces keystrokes and hands the
  // settled value to the caller.
  onSearchChange: (query: string) => void;
};

// Simulated so the skeleton is actually visible on any still-mock list.
// Runs once per mount, which is fine here since these are separate pages
// that fully unmount on navigation, unlike CommentSheet which stays
// mounted.
const SIMULATED_LOAD_MS = 700;

// Real debounce — how long typing has to pause before a new ?search=
// request actually fires.
const SEARCH_DEBOUNCE_MS = 300;

export function UserListWithSearch({
  users,
  emptyLabel,
  isLoading,
  onSearchChange,
}: Props) {
  const [query, setQuery] = useState("");

  // isLoading === undefined means "no real loading state was supplied" —
  // fall back to the original simulated timer in that case only.
  const usesSimulatedLoad = isLoading === undefined;
  const [simulatedLoading, setSimulatedLoading] = useState(usesSimulatedLoad);
  useEffect(() => {
    if (!usesSimulatedLoad) return;
    const timer = window.setTimeout(
      () => setSimulatedLoading(false),
      SIMULATED_LOAD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [usesSimulatedLoad]);

  const realLoading = usesSimulatedLoad ? simulatedLoading : Boolean(isLoading);

  // Only the very FIRST fetch swaps out the whole component (including
  // the search box itself) — tracked with state that, once flipped true,
  // stays true, since `realLoading` goes true again on every later
  // keystroke too (each distinct `search` string is its own
  // query/queryKey — see useFollowersList). Later loads then only ever
  // affect the "searching" skeleton below, not this one. Set
  // during render (React's documented pattern for "adjust state when a
  // value changes" — https://react.dev/learn/you-might-not-need-an-effect)
  // rather than in an effect, so there's no extra render/commit cycle:
  // initial value is derived straight from `realLoading` itself, so a
  // hydrated SSR page (already not loading on first render) starts
  // `true` and never shows this at all.
  const [hasLoadedOnce, setHasLoadedOnce] = useState(!realLoading);
  if (!realLoading && !hasLoadedOnce) {
    setHasLoadedOnce(true);
  }
  const showInitialSkeleton = realLoading && !hasLoadedOnce;

  // Debounce the raw input and hand the settled value to the parent,
  // which feeds it into useFollowersList's `search` param — actual
  // filtering happens in the DB query, not here.
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  useEffect(() => {
    onSearchChange(debouncedQuery.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  if (showInitialSkeleton) {
    return <UserListSkeleton />;
  }

  // `users` already IS the result set for the current debounced query —
  // filtering happens server-side, not here.
  const filtered = users;

  // A real fetch is in flight for the CURRENT debounced query whenever
  // realLoading is true post-initial-load, since each new `search` value
  // starts pending until that specific search's results land.
  const searching = realLoading;
  const hasQuery = query.trim().length > 0;

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
      ) : filtered.length === 0 ? (
        hasQuery ? (
          <p className="px-4 py-10 text-center text-sm text-foreground/50">
            No results for “{query}”
          </p>
        ) : (
          <p className="px-4 py-10 text-center text-sm text-foreground/50">
            {emptyLabel}
          </p>
        )
      ) : (
        filtered.map((user) => (
          <UserListRow
            key={user.username}
            user={user}
            initialFollowing={user.isFollowing}
            initialFollowsMe={user.followsMe}
          />
        ))
      )}
    </>
  );
}
