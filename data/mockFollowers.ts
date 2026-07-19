import { MOCK_USERS } from "./mockUsers";

// Mock-only, and deliberately capped — there's no real "who follows me"
// data model yet (FollowProvider only tracks "who I follow"), and even
// once there is one, a real followers list is something you paginate
// from an API, never render as one unbounded array. This cap is a
// placeholder for that pagination boundary, not just an arbitrary limit.
export const MAX_FOLLOWERS_SHOWN = 50;

export const mockFollowerUsernames = MOCK_USERS.map((u) => u.username).slice(
  0,
  MAX_FOLLOWERS_SHOWN,
);
