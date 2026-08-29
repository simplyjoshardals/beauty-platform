// Plain constants/functions only — deliberately NOT "use client", so
// Server Components (app/page.tsx's SSR prefetch) can import the real
// values instead of a client-reference stub. Client hooks import from
// here too, so there's exactly one definition of each key.
export const POSTS_QUERY_KEY = ["posts"] as const;
export const LIKES_QUERY_KEY = ["likes"] as const;
export const SAVED_QUERY_KEY = ["saved"] as const;

// Shared by the notification page and BottomNav's badge (see
// hooks/useNotifications.ts) — same cache, so they can't ever disagree
// about read state.
export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

// Its own key, deliberately not sharing POSTS_QUERY_KEY — Explore is a
// different query (getExploreFeedPosts, ranked, excludes self + who you
// follow) with a different cache lifetime than Home's feed, even though
// both ultimately return Post[]. Keeping them separate means a post
// mutation that invalidates one doesn't force-refetch the other for no
// reason.
export const EXPLORE_QUERY_KEY = ["explore"] as const;

// Following now round-trips search to the server too (see
// fetchFollowingForSSR / useFollowingList), same as Followers below —
// `search` is part of the key so each distinct search string is its own
// cache entry. Defaults to "" (not omitted) so a Server Component's SSR
// prefetch (app/u/[username]/following/page.tsx,
// app/profile/following/page.tsx — always prefetching the unsearched
// page) and a fresh client mount (whose search state also starts as "")
// construct the exact same key and the server-rendered list hydrates
// without an extra client fetch. useUserProfile's optimistic follow/
// unfollow patches also call this with just a username, so they land on
// that same "" entry — the one guaranteed to be mounted/visible.
export function followingQueryKey(
  username: string | undefined,
  search: string = "",
) {
  return ["following", username, search] as const;
}

// Mirrors followingQueryKey above exactly, just the reverse Follow
// direction.
export function followersQueryKey(
  username: string | undefined,
  search: string = "",
) {
  return ["followers", username, search] as const;
}

// Backs GET /api/explore/users — Explore's "search people" box (see
// useExploreUserSearch / ExploreFeed). Same "search is part of the key"
// convention as followingQueryKey/followersQueryKey above, so each
// distinct debounced query string is its own cache entry — but there's
// no per-user SSR prefetch to line up with here (unlike Following/
// Followers, this isn't scoped to any one profile), so it's just
// ["exploreUserSearch", search] rather than taking a username too.
export function exploreUserSearchQueryKey(search: string) {
  return ["exploreUserSearch", search] as const;
}

export function profileQueryKey(username: string) {
  return ["userProfile", username] as const;
}

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

// Shared prefix so a post mutation elsewhere (create, delete, like,
// comment) can invalidate every per-user posts query at once without
// knowing which usernames are cached — invalidateQueries matches by
// prefix, so USER_POSTS_QUERY_KEY_PREFIX alone hits every entry.
// USER_POSTS_QUERY_KEY(username) is the full key useUserPosts queries
// with client-side, and what a Server Component prefetches into —
// kept here (not in hooks/useUserPosts.ts) so both sides, and
// app/profile/page.tsx + app/u/[username]/page.tsx, construct the
// exact same key from one definition.
export const USER_POSTS_QUERY_KEY_PREFIX = ["userPosts"] as const;

export function USER_POSTS_QUERY_KEY(username: string | undefined) {
  return [...USER_POSTS_QUERY_KEY_PREFIX, username] as const;
}
