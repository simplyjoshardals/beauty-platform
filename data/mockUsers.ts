import type { ProductTag } from "@/types/post";

export type MockUser = {
  username: string;
  avatarSrc: string;
  toneTag?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  pinnedRoutine?: ProductTag[];
};

// Small directory so usernames elsewhere in mock data (FollowProvider's
// Set<string>, mock followers, post authors) can be resolved to something
// displayable. Not a real user database — just enough to render follower/
// following lists and other-user profile pages without blank fields.
export const MOCK_USERS: MockUser[] = [
  {
    username: "glowbyash",
    avatarSrc: "/mock/avatar-1.webp",
    toneTag: "Combination skin",
    bio: "Soft glam, skincare-first. Lagos.",
    followerCount: 8420,
    followingCount: 312,
    pinnedRoutine: [
      { id: "gr1", label: "Cleanser: La Roche-Posay Toleriane" },
      { id: "gr2", label: "Foundation: Fenty Pro Filt'r 240" },
    ],
  },
  {
    username: "skinbytemi",
    avatarSrc: "/mock/avatar-2.webp",
    bio: "Skincare that actually works, tested on my own face.",
    followerCount: 15230,
    followingCount: 189,
  },
  {
    username: "northofnorml",
    avatarSrc: "/mock/avatar-3.webp",
    bio: "Relatable adulting, occasionally about skin.",
    followerCount: 2104,
    followingCount: 540,
  },
  {
    username: "grwmwithnaomi",
    avatarSrc: "/mock/avatar-4.webp",
    bio: "GRWM every week. Full routines, no shortcuts.",
    followerCount: 41200,
    followingCount: 98,
  },
  {
    username: "tobiwears",
    avatarSrc: "/mock/avatar-5.webp",
    followerCount: 640,
    followingCount: 210,
  },
  {
    username: "beautywithzee",
    avatarSrc: "/mock/avatar-6.webp",
    followerCount: 320,
    followingCount: 150,
  },
  {
    username: "lashlounge_ng",
    avatarSrc: "/mock/avatar-7.webp",
    followerCount: 980,
    followingCount: 60,
  },
  {
    username: "kemi.contours",
    avatarSrc: "/mock/avatar-8.webp",
    followerCount: 1450,
    followingCount: 210,
  },
  {
    username: "skincare.diary",
    avatarSrc: "/mock/avatar-9.webp",
    followerCount: 720,
    followingCount: 340,
  },
  {
    username: "browsbyfunmi",
    avatarSrc: "/mock/avatar-10.webp",
    followerCount: 510,
    followingCount: 90,
  },
];

export function getMockUser(username: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.username === username);
}
