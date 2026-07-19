export type MockUser = {
  username: string;
  avatarSrc: string;
  toneTag?: string;
};

// Small directory so usernames elsewhere in mock data (FollowProvider's
// Set<string>, mock followers) can be resolved to something displayable
// (avatar, tone tag). Not a real user database — just enough to render
// follower/following lists without every row looking blank.
export const MOCK_USERS: MockUser[] = [
  {
    username: "glowbyash",
    avatarSrc: "/mock/avatar-1.webp",
    toneTag: "Combination skin",
  },
  { username: "skinbytemi", avatarSrc: "/mock/avatar-2.webp" },
  { username: "northofnorml", avatarSrc: "/mock/avatar-3.webp" },
  { username: "grwmwithnaomi", avatarSrc: "/mock/avatar-4.webp" },
  { username: "tobiwears", avatarSrc: "/mock/avatar-5.webp" },
  { username: "beautywithzee", avatarSrc: "/mock/avatar-6.webp" },
  { username: "lashlounge_ng", avatarSrc: "/mock/avatar-7.webp" },
  { username: "kemi.contours", avatarSrc: "/mock/avatar-8.webp" },
  { username: "skincare.diary", avatarSrc: "/mock/avatar-9.webp" },
  { username: "browsbyfunmi", avatarSrc: "/mock/avatar-10.webp" },
];

export function getMockUser(username: string): MockUser {
  return (
    MOCK_USERS.find((u) => u.username === username) ?? {
      username,
      avatarSrc: "/mock/avatar-placeholder.webp",
    }
  );
}
