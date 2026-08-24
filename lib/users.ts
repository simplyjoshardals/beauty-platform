import { prisma } from "./prisma";

export type FullCurrentUser = {
  id: string;
  username: string;
  email: string;
  avatarSrc: string;
  bio: string;
  toneTag: string;
  pinnedRoutine: { id: string; label: string }[];
  onboardingCompletedAt: string | null;
  followerCount: number;
  followingCount: number;
  // Sourced from the same _count select as followerCount/followingCount
  // below — a free aggregate on the one user row lookup, not derived
  // from fetching the user's actual posts. Lets ProfileHeader show the
  // real count immediately, without waiting on the separate (heavier,
  // media-joined) posts query the grid itself runs.
  postCount: number;
};

export async function getFullCurrentUser(
  userId: string,
): Promise<FullCurrentUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      routineItems: { orderBy: { order: "asc" } },
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarSrc: user.avatarSrc,
    bio: user.bio,
    toneTag: user.toneTag,
    pinnedRoutine: user.routineItems.map((item) => ({
      id: item.id,
      label: item.label,
    })),
    onboardingCompletedAt: user.onboardingCompletedAt
      ? user.onboardingCompletedAt.toISOString()
      : null,
    followerCount: user._count.followers,
    followingCount: user._count.following,
    postCount: user._count.posts,
  };
}

export type FollowingListUser = {
  id: string;
  username: string;
  avatarSrc: string;
  toneTag: string;
};

export async function getFollowingList(
  username: string,
  search?: string,
): Promise<FollowingListUser[] | null> {
  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!target) return null;

  const follows = await prisma.follow.findMany({
    where: {
      followerId: target.id,
      ...(search
        ? { following: { username: { contains: search, mode: "insensitive" } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      following: {
        select: { id: true, username: true, avatarSrc: true, toneTag: true },
      },
    },
  });
  return follows.map((f) => f.following);
}

export type PublicUserProfile = {
  id: string;
  username: string;
  avatarSrc: string;
  bio: string;
  toneTag: string;
  pinnedRoutine: { id: string; label: string }[];
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  followsMe: boolean;
  // See the identical comment on FullCurrentUser.postCount above — same
  // free _count aggregate, same reason: ProfileHeader shouldn't have to
  // wait on the posts-with-media query just to show a number.
  postCount: number;
};

export async function getPublicUserProfile(
  username: string,
  viewerId: string | null,
): Promise<PublicUserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      routineItems: { orderBy: { order: "asc" } },
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });
  if (!user) return null;

  let isFollowing = false;
  let followsMe = false;
  if (viewerId && viewerId !== user.id) {
    const [followingRow, followerRow] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: user.id,
          },
        },
        select: { id: true },
      }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: viewerId,
          },
        },
        select: { id: true },
      }),
    ]);
    isFollowing = Boolean(followingRow);
    followsMe = Boolean(followerRow);
  }

  return {
    id: user.id,
    username: user.username,
    avatarSrc: user.avatarSrc,
    bio: user.bio,
    toneTag: user.toneTag,
    pinnedRoutine: user.routineItems.map((item) => ({
      id: item.id,
      label: item.label,
    })),
    followerCount: user._count.followers,
    followingCount: user._count.following,
    isFollowing,
    followsMe,
    postCount: user._count.posts,
  };
}

export async function getPublicUserProfilesBatch(
  usernames: string[],
  viewerId: string | null,
): Promise<Map<string, PublicUserProfile>> {
  if (usernames.length === 0) return new Map();

  const users = await prisma.user.findMany({
    where: { username: { in: usernames } },
    include: {
      routineItems: { orderBy: { order: "asc" } },
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });

  const otherUserIds = viewerId
    ? users.filter((u) => u.id !== viewerId).map((u) => u.id)
    : [];

  const [followingRows, followerRows] =
    viewerId && otherUserIds.length > 0
      ? await Promise.all([
          prisma.follow.findMany({
            where: { followerId: viewerId, followingId: { in: otherUserIds } },
            select: { followingId: true },
          }),
          prisma.follow.findMany({
            where: { followerId: { in: otherUserIds }, followingId: viewerId },
            select: { followerId: true },
          }),
        ])
      : [[], []];

  const followingSet = new Set(followingRows.map((r) => r.followingId));
  const followerSet = new Set(followerRows.map((r) => r.followerId));

  const profiles = new Map<string, PublicUserProfile>();
  for (const user of users) {
    const isSelf = viewerId === user.id;
    profiles.set(user.username, {
      id: user.id,
      username: user.username,
      avatarSrc: user.avatarSrc,
      bio: user.bio,
      toneTag: user.toneTag,
      pinnedRoutine: user.routineItems.map((item) => ({
        id: item.id,
        label: item.label,
      })),
      followerCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing: !isSelf && followingSet.has(user.id),
      followsMe: !isSelf && followerSet.has(user.id),
      postCount: user._count.posts,
    });
  }
  return profiles;
}