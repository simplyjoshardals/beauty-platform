// Plain constants/functions only — deliberately NOT "use client", so
// Server Components (app/page.tsx's SSR prefetch) can import the real
// values instead of a client-reference stub. Client hooks import from
// here too, so there's exactly one definition of each key.
export const POSTS_QUERY_KEY = ["posts"] as const;
export const LIKES_QUERY_KEY = ["likes"] as const;
export const SAVED_QUERY_KEY = ["saved"] as const;

export function followingQueryKey(username: string | undefined) {
  return ["following", username] as const;
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
