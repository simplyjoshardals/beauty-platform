// Everything from the shared boilerplate's API_ROUTES that isn't shown
// here (ADMIN, DEPOSITS, WITHDRAWALS, TRANSACTIONS, SUPPORT, PRICES)
// belonged to a different app template — not part of Vanity, and not
// carried over. Add new sections here as real Vanity feature endpoints
// (comments, follow, saved, notifications) get built.
export const API_ROUTES = {
  AUTH: {
    // Unified signup + login + resend — same call every time, since a
    // magic link makes all three the same action.
    REQUEST_LINK: "/api/auth/request-link",
    VERIFY_TOKEN: (token: string) => `/api/auth/verify/${token}`,
    LOGOUT: "/api/auth/logout",
    REFRESH_TOKEN: "/api/auth/refresh-token",
  },

  USER: {
    ME: "/api/user/me",
    ONBOARDING: "/api/user/onboarding",
    CHECK_USERNAME: (username: string) =>
      `/api/user/username-available?username=${encodeURIComponent(username)}`,
    // Public profile lookup + follow toggle for viewing someone ELSE's
    // profile (/u/[username]) — distinct from ME above, which is only
    // ever the logged-in caller's own record.
    PROFILE: (username: string) => `/api/user/${encodeURIComponent(username)}`,
    TOGGLE_FOLLOW: (username: string) =>
      `/api/user/${encodeURIComponent(username)}/follow`,
    // Dedicated per-user posts route (GET /api/user/[username]/posts) —
    // backs useUserPosts, used by both /u/[username] and /profile instead
    // of filtering the full feed client-side. Public, same as PROFILE.
    POSTS: (username: string) =>
      `/api/user/${encodeURIComponent(username)}/posts`,
  },

  UPLOAD: {
    SIGNATURE: "/api/upload/signature",
  },

  POSTS: {
    LIST: "/api/posts",
    CREATE: "/api/posts",
    DELETE: (postId: string) => `/api/posts/${postId}`,
    // GET returns every post id the current user has liked; POST toggles
    // a single post's like state — same BUNDLE/TOGGLE split as SAVED
    // below.
    LIKES_BUNDLE: "/api/posts/likes",
    TOGGLE_LIKE: (postId: string) => `/api/posts/${postId}/like`,
  },

  COMMENTS: {
    LIST: (postId: string) => `/api/posts/${postId}/comments`,
    CREATE: (postId: string) => `/api/posts/${postId}/comments`,
    DELETE: (postId: string, commentId: string) =>
      `/api/posts/${postId}/comments/${commentId}`,
    TOGGLE_LIKE: (postId: string, commentId: string) =>
      `/api/posts/${postId}/comments/${commentId}/like`,
  },

  SAVED: {
    // GET returns the whole bundle (saved post ids + every collection
    // with its post ids); POST toggles a post's overall saved state.
    BUNDLE: "/api/saved",
    TOGGLE_SAVE: "/api/saved",
    CREATE_COLLECTION: "/api/saved/collections",
    RENAME_COLLECTION: (collectionId: string) =>
      `/api/saved/collections/${collectionId}`,
    DELETE_COLLECTION: (collectionId: string) =>
      `/api/saved/collections/${collectionId}`,
    TOGGLE_COLLECTION_POST: (collectionId: string) =>
      `/api/saved/collections/${collectionId}/posts`,
  },
};
