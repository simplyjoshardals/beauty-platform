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

// Mirrors getFollowingList exactly, just the reverse Follow direction
// (followingId = target, not followerId) — same optional case-insensitive
// ?search=, same null-on-missing-user contract. Backs both
// GET /api/user/[username]/followers (see that route) and the SSR
// prefetch for /profile/followers and /u/[username]/followers (see
// lib/serverQueries.ts's fetchFollowersForSSR) — one query, not two
// separate implementations of the same lookup.
export async function getFollowersList(
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
      followingId: target.id,
      ...(search
        ? { follower: { username: { contains: search, mode: "insensitive" } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      follower: {
        select: { id: true, username: true, avatarSrc: true, toneTag: true },
      },
    },
  });
  return follows.map((f) => f.follower);
}

// Backs GET /api/explore/users — Explore's "search people" box.
// Deliberately its own query rather than a slice of getFollowingList/
// getFollowersList: this searches every user in the app, not one
// person's follow edges. Case-insensitive `contains` on username, same
// as the follow-list searches, and caps results since there's no follow
// relationship here to naturally bound the set size.
//
// The viewer's own row is included on purpose — searching your own
// username should surface your own profile, same as anyone else's.
// UserListRow already hides the follow button for isSelf rows, so
// there's nothing else to special-case here.
const EXPLORE_USER_SEARCH_LIMIT = 20;

export type ExploreSearchUser = FollowingListUser & {
  isFollowing: boolean;
  followsMe: boolean;
  isSelf: boolean;
};

export async function searchUsers(
  query: string,
  viewerId: string,
): Promise<ExploreSearchUser[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const users = await prisma.user.findMany({
    where: {
      username: { contains: trimmed, mode: "insensitive" },
    },
    orderBy: { username: "asc" },
    take: EXPLORE_USER_SEARCH_LIMIT,
    select: { id: true, username: true, avatarSrc: true, toneTag: true },
  });
  if (users.length === 0) return [];

  // One batched pair of queries for the whole result page rather than a
  // per-row lookup — this is what lets the row render the right
  // Follow/Following label on the very first paint instead of flashing
  // "Follow" for a beat while a separate per-user fetch resolves.
  const ids = users.map((u) => u.id);
  const [followingRows, followerRows] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: viewerId, followingId: { in: ids } },
      select: { followingId: true },
    }),
    prisma.follow.findMany({
      where: { followingId: viewerId, followerId: { in: ids } },
      select: { followerId: true },
    }),
  ]);
  const followingSet = new Set(followingRows.map((f) => f.followingId));
  const followerSet = new Set(followerRows.map((f) => f.followerId));

  return users.map((u) => ({
    ...u,
    isFollowing: followingSet.has(u.id),
    followsMe: followerSet.has(u.id),
    isSelf: u.id === viewerId,
  }));
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