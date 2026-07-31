// Kept in sync manually with the frontend's own copy of these numbers —
// CheckEmailScreen.tsx shows "Resend in 30s" and "The link expires in 15
// minutes" as plain UI text, not read from here. If either value changes,
// both places need updating; they're not currently shared across the
// stack.
export const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
export const MAGIC_LINK_EXPIRES_MS = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_EXPIRES_DAYS = 30;

// Single source of truth for the access token's lifetime, in seconds —
// used both to sign the JWT itself (lib/auth.ts) and to set the
// matching cookie Max-Age (lib/authCookies.ts). Previously these were
// two separate literals ("15m" string vs. a hardcoded 15*60) that only
// happened to agree; changing one without the other would silently
// reintroduce the cookie/token expiry mismatch bug from earlier.
export const ACCESS_TOKEN_EXPIRES_SECONDS = 15 * 60;
