// Single source of truth for username format rules — used both
// client-side (utils/username.ts's validation, the live
// useUsernameAvailability hook) and server-side (the onboarding and
// username-available API routes). Kept dependency-free on purpose, so
// it's safe to import from either environment without dragging in
// anything browser- or server-only.
export const USERNAME_PATTERN = /^[a-z0-9_.]{3,20}$/;
export const USERNAME_FORMAT_ERROR =
  "3–20 characters: lowercase letters, numbers, underscores, or periods.";
