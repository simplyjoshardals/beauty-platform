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
