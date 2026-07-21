import { MOCK_USERS } from "./mockUsers";

// Mock-only, and deliberately capped — there's no real "who follows me"
// data model yet (FollowProvider only tracks "who I follow"), and even
// once there is one, a real followers list is something you paginate
// from an API, never render as one unbounded array. This cap is a
// placeholder for that pagination boundary, not just an arbitrary limit.
export const MAX_FOLLOWERS_SHOWN = 50;

// Mock-only, and deliberately capped — there's no real per-user follow
// graph, only FollowProvider's tracking of who *you* follow. Every
// profile's followers/following list draws from this same shared pool of
// mock users (excluding the profile owner), the same way a real paginated
// API result would be capped. It's identical for every username on
// purpose — this is a stand-in, not real relationship data.
export function getMockConnectionsFor(username: string) {
  return MOCK_USERS.filter((u) => u.username !== username).slice(
    0,
    MAX_FOLLOWERS_SHOWN,
  );
}

export const mockFollowerUsernames = MOCK_USERS.map((u) => u.username).slice(
  0,
  MAX_FOLLOWERS_SHOWN,
);

// Used to decide whether a Follow button should say "Follow back" — if
// this person is already in your (mock) followers list and you don't
// follow them yet, that's a follow-back, not a cold follow.
export function isMockFollowerOfCurrentUser(username: string): boolean {
  return mockFollowerUsernames.includes(username);
}
