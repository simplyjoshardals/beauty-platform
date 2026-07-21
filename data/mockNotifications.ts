import type { Notification } from "@/types/notification";

// Mock data, built from usernames/posts that already exist elsewhere in
// the app (MOCK_USERS, mockPosts) so links actually resolve to something.
export const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "like",
    actor: { username: "skinbytemi", avatarSrc: "/mock/avatar-2.webp" },
    postId: "1",
    createdAt: "2026-07-19T09:10:00Z",
    read: false,
  },
  {
    id: "n2",
    type: "comment",
    actor: { username: "tobiwears", avatarSrc: "/mock/avatar-5.webp" },
    postId: "1",
    commentText: "the blend on your cheek is unreal, what brush?",
    createdAt: "2026-07-19T08:45:00Z",
    read: false,
  },
  {
    id: "n3",
    type: "follow",
    actor: { username: "beautywithzee", avatarSrc: "/mock/avatar-6.webp" },
    createdAt: "2026-07-18T21:30:00Z",
    read: false,
  },
  {
    id: "n4",
    type: "reply",
    actor: { username: "glowbyash", avatarSrc: "/mock/avatar-1.webp" },
    postId: "1",
    commentText: "a cheap synthetic one honestly, technique matters more",
    createdAt: "2026-07-18T20:52:00Z",
    read: true,
  },
  {
    id: "n5",
    type: "like",
    actor: { username: "northofnorml", avatarSrc: "/mock/avatar-3.webp" },
    postId: "2",
    createdAt: "2026-07-17T15:00:00Z",
    read: true,
  },
  {
    id: "n6",
    type: "follow",
    actor: { username: "kemi.contours", avatarSrc: "/mock/avatar-8.webp" },
    createdAt: "2026-07-16T12:00:00Z",
    read: true,
  },
  {
    id: "n7",
    type: "like",
    actor: { username: "lashlounge_ng", avatarSrc: "/mock/avatar-7.webp" },
    postId: "1",
    createdAt: "2026-07-15T22:15:00Z",
    read: true,
  },
];
