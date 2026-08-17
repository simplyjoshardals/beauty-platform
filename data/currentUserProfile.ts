// Placeholder social-stat content for the logged-in user that still has
// no real backend source. bio/toneTag/pinnedRoutine used to live here
// too, but those are now real profile fields served by /api/user/me
// (see useCurrentUser) — only followerCount remains mocked, since
// there's no real followers system yet.
export const CURRENT_USER_PROFILE = {
  followerCount: 1204,
};
