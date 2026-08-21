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
