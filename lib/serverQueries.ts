import { cache } from "react";
import {
  getPostsByUsername,
  getHomeFeedPosts,
  getExploreFeedPosts,
} from "./posts";
import { getSavedBundle } from "./saved";
import {
  getFullCurrentUser,
  getFollowingList,
  getFollowersList,
  getPublicUserProfile,
  getPublicUserProfilesBatch,
} from "./users";
import { getLikedPostIds } from "./likes";

// Same query GET /api/posts runs (getHomeFeedPosts, in lib/posts.ts),
// called directly instead of over HTTP — same pattern as
// fetchUserPostsForSSR below. Home is always behind RequireAuth, but SSR
// for that first (logged-out) paint still runs before the client-side
// redirect fires, so a null userId — no session yet — just gets the
// empty feed rather than every post in the app.
export async function fetchPostsForSSR(userId: string | null) {
  if (!userId) return [];
  return getHomeFeedPosts(userId);
}

// Backs /explore — same query GET /api/explore runs (getExploreFeedPosts,
// in lib/posts.ts), called directly instead of over HTTP, same
// null-userId posture as fetchPostsForSSR above: Explore is always
// behind RequireAuth, but SSR for that first (logged-out) paint still
// runs before the client-side redirect fires, so a null userId just
// gets the empty grid rather than an ownerless "everyone" ranking.
export async function fetchExplorePostsForSSR(userId: string | null) {
  if (!userId) return [];
  return getExploreFeedPosts(userId);
}

// Backs the post grid on both /profile and /u/[username] — same query
// GET /api/user/[username]/posts runs (getPostsByUsername, in
// lib/posts.ts), called directly instead of over HTTP. Called from
// inside PostGridSection (components/profile/PostGridSection.tsx),
// which both pages render behind a <Suspense> boundary — this is
// deliberately the slow, heavier query (media, carousel items,
// products, per-post like/comment counts), kept separate from the cheap
// profile lookup above so the header can render and stream to the
// client without waiting on this to resolve. Takes a username rather
// than a userId: the caller (PostGridSection) doesn't necessarily have
// a userId on hand without its own extra lookup, and getPostsByUsername
// resolving one internally is cheap next to the query it's paired with
// here anyway.
export async function fetchUserPostsForSSR(username: string) {
  return getPostsByUsername(username);
}

// Backs /u/[username]'s header — same lookup GET /api/user/[username]
// runs (including the viewer-relative isFollowing/followsMe, and a real
// postCount via _count — see lib/users.ts), called directly and awaited
// before anything is flushed to the client, so the header renders with
// real data (including the post count) on first paint, and a
// nonexistent username 404s server-side instead of after mount.
export async function fetchUserProfileForSSR(
  username: string,
  viewerId: string | null,
) {
  return getPublicUserProfile(username, viewerId);
}

export async function fetchLikedPostIdsForSSR(userId: string) {
  return getLikedPostIds(userId);
}

// Backs /saved and /saved/[collectionId] — same query GET /api/saved
// runs (getSavedBundle, in lib/saved.ts), called directly instead of
// over HTTP, same convention as fetchUserPostsForSSR above. Returns the
// actual saved Post[] (queried via the SavedPost join), not just ids to
// cross-reference against some other already-fetched list — see
// getSavedBundle's own comment for why that distinction matters.
export async function fetchSavedBundleForSSR(userId: string) {
  return getSavedBundle(userId);
}

// Backs /profile/following and /u/[username]/following — same query GET
// /api/user/[username]/following runs (getFollowingList, in
// lib/users.ts), called directly instead of over HTTP. Only ever called
// with `search` omitted: that's the one cache entry
// (followingQueryKey(username, "")) a fresh client mount always agrees
// with, so the server-rendered list hydrates without an immediate
// refetch — any later search the visitor types runs as its own
// client-side fetch instead (see UserListWithSearch's server-search
// mode).
export async function fetchFollowingForSSR(username: string, search?: string) {
  return (await getFollowingList(username, search)) ?? [];
}

// Backs /profile/followers and /u/[username]/followers — same query GET
// /api/user/[username]/followers runs (getFollowersList, in
// lib/users.ts), called directly instead of over HTTP, same convention
// as fetchFollowingForSSR above. Only ever called with `search`
// omitted: that's the one cache entry (followersQueryKey(username, ""))
// a fresh client mount always agrees with, so the server-rendered list
// hydrates without an immediate refetch — any later search the visitor
// types runs as its own client-side fetch instead (see
// UserListWithSearch's server-search mode).
export async function fetchFollowersForSSR(username: string, search?: string) {
  return (await getFollowersList(username, search)) ?? [];
}

export async function fetchUserProfilesBatchForSSR(
  usernames: string[],
  viewerId: string,
) {
  return getPublicUserProfilesBatch(usernames, viewerId);
}

// Wrapped in React's cache() so calling this from both the root layout
// (for the global currentUser hydration BottomNav etc. need on every
// route) and a page (for its own SSR prefetches) within the same
// request only hits the DB once — React dedupes by arguments for the
// lifetime of a single render pass.
export const fetchCurrentUserForSSR = cache(async (userId: string) => {
  return getFullCurrentUser(userId);
});
