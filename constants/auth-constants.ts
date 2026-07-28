// Kept in sync manually with the frontend's own copy of these numbers —
// CheckEmailScreen.tsx shows "Resend in 30s" and "The link expires in 15
// minutes" as plain UI text, not read from here. If either value changes,
// both places need updating; they're not currently shared across the
// stack.
export const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
export const MAGIC_LINK_EXPIRES_MS = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_EXPIRES_DAYS = 30;
