import { USERNAME_PATTERN, USERNAME_FORMAT_ERROR } from "@/constants/username";

// Format only — "taken" is no longer checked here. It used to compare
// against MOCK_USERS (frontend-only demo data with no relation to the
// real database), which meant it could falsely reject a genuinely
// available username just because it happened to collide with a fake
// demo account. Real uniqueness now belongs entirely to the backend:
// useUsernameAvailability for live feedback, and the onboarding
// endpoint's own check as the final authority.
export function validateUsername(value: string): string | null {
  const trimmed = value.trim().toLowerCase();

  if (trimmed.length === 0) return "Choose a username.";
  if (!USERNAME_PATTERN.test(trimmed)) {
    return USERNAME_FORMAT_ERROR;
  }

  return null;
}
