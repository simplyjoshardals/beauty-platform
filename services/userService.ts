import { apiFetch } from "@/utils/apiClient";
import { API_ROUTES } from "@/utils/apiRoutes";
import type { ProductTag } from "@/types/post";

export type CompleteOnboardingInput = {
  username: string;
  // Must be a real uploaded URL from useUploadMedia — never a blob:
  // URL. Onboarding's own submission logic is responsible for only
  // ever passing a real one through (or omitting it entirely).
  avatarSrc?: string;
  toneTag?: string;
  bio?: string;
};

export async function completeOnboarding(data: CompleteOnboardingInput) {
  // authRequired defaults to true here (unlike getCurrentUser, which
  // explicitly opts out) — this genuinely needs a valid session, and if
  // the access token happens to be stale, apiFetch's built-in
  // refresh-and-retry logic is exactly what should handle that.
  return apiFetch(API_ROUTES.USER.ONBOARDING, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function checkUsernameAvailability(username: string) {
  return apiFetch(API_ROUTES.USER.CHECK_USERNAME(username), {
    method: "GET",
  });
}

export type UpdateProfileInput = {
  username?: string;
  // Must be a real uploaded URL from useUploadMedia — never a blob:
  // URL. Same caveat as CompleteOnboardingInput's avatarSrc.
  avatarSrc?: string;
  toneTag?: string;
  bio?: string;
  pinnedRoutine?: ProductTag[];
};

export async function updateProfile(data: UpdateProfileInput) {
  return apiFetch(API_ROUTES.USER.ME, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Backs /u/[username] — that page renders logged out too (same as
// /p/[postId]), so authRequired: false here for the same reason it's
// false on getCurrentUser/getLikedPostIds: a 401 just means "anonymous
// visitor," not a real failure, and apiFetch's default 401 handling
// (refresh-then-redirect) would otherwise boot a logged-out visitor off
// an intentionally-public page.
export async function getUserProfile(username: string) {
  return apiFetch(API_ROUTES.USER.PROFILE(username), {
    method: "GET",
    authRequired: false,
  });
}

export async function toggleFollowUser(username: string) {
  return apiFetch(API_ROUTES.USER.TOGGLE_FOLLOW(username), {
    method: "POST",
  });
}

// Backs /profile/following and /u/[username]/following. Unlike
// getUserProfile above, authRequired is left at its default (true) —
// the endpoint itself requires a session (see the route handler), so
// there's no "anonymous visitor" case to opt out of apiFetch's normal
// 401 handling for here.
export async function getFollowing(username: string, search?: string) {
  return apiFetch(API_ROUTES.USER.FOLLOWING(username, search), {
    method: "GET",
  });
}

// Backs /profile/followers. Same contract as getFollowing above.
export async function getFollowers(username: string, search?: string) {
  return apiFetch(API_ROUTES.USER.FOLLOWERS(username, search), {
    method: "GET",
  });
}

// Backs /explore's "search people" box. Same authRequired default (true)
// as getFollowing/getFollowers above — GET /api/explore/users requires a
// session same as the rest of /api/explore.
export async function searchUsers(search: string) {
  return apiFetch(API_ROUTES.EXPLORE.SEARCH_USERS(search), {
    method: "GET",
  });
}
