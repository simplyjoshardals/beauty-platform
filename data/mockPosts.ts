import type { Post } from "@/types/post";

// Mock data for now — swap for a real fetch once the API's ready.
// Sorted chronologically, newest first. No ranking logic on purpose.
// Lives here (not inside HomeFeed) so the single-post route can look up
// an individual post by id without duplicating this list.
//
// Every author object now carries a stable `id` (mirroring their
// username here, since these seeded mock users never rename) — required
// by the Post/Comment types so ownership comparisons app-wide can key off
// id instead of username, the same fix applied to the real current user.
export const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      id: "glowbyash",
      username: "glowbyash",
      avatarSrc: "/mock/avatar-1.webp",
      toneTag: "Combination skin",
    },
    media: {
      id: "m1",
      type: "image",
      src: "/mock/post-1.webp",
      alt: "Finished soft glam look",
    },
    products: [
      { id: "p1", label: "Foundation: Fenty Pro Filt'r 240" },
      { id: "p2", label: "Concealer: NARS Radiant Creamy" },
      { id: "p3", label: "Lip: Rare Beauty Lip Soufflé" },
    ],
    caption:
      "Soft glam for date night, took me 20 minutes tonight and I'm obsessed with how the base sat all evening.",
    likeCount: 214,
    commentCount: 18,
    comments: [
      {
        id: "c1",
        author: {
          id: "tobiwears",
          username: "tobiwears",
          avatarSrc: "/mock/avatar-5.webp",
        },
        text: "the blend on your cheek is unreal, what brush?",
        likeCount: 4,
        createdAt: "2026-07-15T20:45:00Z",
        replies: [
          {
            id: "c1r1",
            author: {
              id: "glowbyash",
              username: "glowbyash",
              avatarSrc: "/mock/avatar-1.webp",
            },
            text: "a cheap synthetic one honestly, technique matters more",
            likeCount: 9,
            createdAt: "2026-07-15T20:52:00Z",
          },
        ],
      },
      {
        id: "c9",
        author: {
          id: "skinbytemi",
          username: "skinbytemi",
          avatarSrc: "/mock/avatar-2.webp",
        },
        text: "this is lovely",
        likeCount: 12,
        createdAt: "2026-07-15T20:00:00Z",
      },
      {
        id: "c2",
        author: {
          id: "glowbyash",
          username: "glowbyash",
          avatarSrc: "/mock/avatar-1.webp",
        },
        text: "thank youuu 🥹",
        likeCount: 12,
        createdAt: "2026-07-15T21:02:00Z",
      },
      {
        id: "c3",
        author: {
          id: "tobiwears",
          username: "tobiwears",
          avatarSrc: "/mock/avatar-5.webp",
        },
        text: "the blend on your cheek is unreal, what makeup?",
        likeCount: 4,
        createdAt: "2026-07-15T20:46:00Z",
        replies: [
          {
            id: "c1r2",
            author: {
              id: "glowbyash",
              username: "glowbyash",
              avatarSrc: "/mock/avatar-1.webp",
            },
            text: "a cheap synthetic one honestly, technique matters more",
            likeCount: 9,
            createdAt: "2026-07-15T20:53:00Z",
          },
        ],
      },
    ],
    createdAt: "2026-07-15T20:00:00Z",
  },
  {
    id: "2",
    author: {
      id: "skinbytemi",
      username: "skinbytemi",
      avatarSrc: "/mock/avatar-2.webp",
    },
    media: {
      id: "m2",
      type: "before_after",
      before: { src: "/mock/before-2.webp", alt: "Skin before routine" },
      after: { src: "/mock/after-2.webp", alt: "Skin after 6 weeks" },
    },
    products: [{ id: "p4", label: "Serum: The Ordinary Niacinamide 10%" }],
    caption:
      "6 weeks of consistent niacinamide + spf. Texture is finally calming down.",
    likeCount: 892,
    commentCount: 64,
    createdAt: "2026-07-15T14:30:00Z",
  },
  {
    id: "3",
    author: {
      id: "northofnorml",
      username: "northofnorml",
      avatarSrc: "/mock/avatar-3.webp",
    },
    media: {
      id: "m3",
      type: "carousel",
      items: [
        { src: "/mock/carousel-3a.webp", alt: "Step 1" },
        { src: "/mock/carousel-3b.webp", alt: "Step 2" },
        { src: "/mock/carousel-3c.webp", alt: "Final look" },
      ],
    },
    caption:
      "Three products, no primer, still lasted through Lagos heat all day.",
    likeCount: 133,
    commentCount: 9,
    createdAt: "2026-07-14T18:00:00Z",
  },
  {
    id: "4",
    author: {
      id: "grwmwithnaomi",
      username: "grwmwithnaomi",
      avatarSrc: "/mock/avatar-4.webp",
    },
    media: {
      id: "m4",
      type: "video",
      src: "/mock/grwm-4.mp4",
      poster: "/mock/grwm-4-poster.webp",
    },
    products: [
      { id: "p5", label: "Brow: Anastasia Brow Freeze" },
      { id: "p6", label: "Blush: Milk Cooling Water" },
    ],
    caption:
      "GRWM for a rooftop birthday dinner, full routine start to finish.",
    likeCount: 1420,
    commentCount: 203,
    createdAt: "2026-07-14T09:00:00Z",
  },
];
