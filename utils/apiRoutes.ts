// Everything from the shared boilerplate's API_ROUTES that isn't shown
// here (ADMIN, DEPOSITS, WITHDRAWALS, TRANSACTIONS, SUPPORT, PRICES)
// belonged to a different app template — not part of Vanity, and not
// carried over. Add new sections here as real Vanity feature endpoints
// (posts, comments, follow, saved, notifications) get built.
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
  },
};
