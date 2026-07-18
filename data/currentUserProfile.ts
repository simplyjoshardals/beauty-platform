import type { ProductTag } from "@/types/post";

// Placeholder profile content for the logged-in user, kept separate from
// CURRENT_USER (identity: username/avatar) since this is profile content,
// not auth data. Swap for a real fetch once there's a backend.
export const CURRENT_USER_PROFILE = {
  bio: "Combination skin, always testing something new. Lagos-based.",
  toneTag: "Combination skin",
  followerCount: 1204,
  pinnedRoutine: [
    { id: "r1", label: "Cleanser: CeraVe Foaming" },
    { id: "r2", label: "Serum: The Ordinary Niacinamide 10%" },
    { id: "r3", label: "Moisturizer: La Roche-Posay Cicaplast" },
    { id: "r4", label: "SPF: Black Girl Sunscreen" },
  ] satisfies ProductTag[],
};
