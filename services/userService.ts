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
