import { MOCK_USERS } from "@/data/mockUsers";

const USERNAME_PATTERN = /^[a-z0-9_.]{3,20}$/;

export function validateUsername(
  value: string,
  currentUsername: string,
): string | null {
  const trimmed = value.trim().toLowerCase();

  if (trimmed.length === 0) return "Choose a username.";
  if (!USERNAME_PATTERN.test(trimmed)) {
    return "3–20 characters: lowercase letters, numbers, underscores, or periods.";
  }
  // Comparing against MOCK_USERS only, not the real user's own current
  // value — otherwise saving your own unchanged username would falsely
  // flag as "taken."
  const taken =
    trimmed !== currentUsername.toLowerCase() &&
    MOCK_USERS.some((u) => u.username.toLowerCase() === trimmed);
  if (taken) return "That username is already taken.";

  return null;
}
