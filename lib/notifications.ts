import { prisma } from "./prisma";
import { NotificationType as PrismaNotificationType } from "./generated/prisma/client";
import type { Notification } from "@/types/notification";

export const MAX_NOTIFICATIONS = 50;

// Every trigger (post like, comment, reply, comment like, follow) calls
// this one helper rather than creating a Notification row itself — the
// self-notification guard and the shape of what gets written both live
// here exactly once, so no individual route can forget either.
type CreateNotificationArgs = {
  recipientId: string;
  actorId: string;
  type: PrismaNotificationType;
  postId?: string;
  commentId?: string;
  commentText?: string;
};

export async function createNotification({
  recipientId,
  actorId,
  type,
  postId,
  commentId,
  commentText,
}: CreateNotificationArgs): Promise<void> {
  // Liking/commenting/following your own stuff never produces a
  // notification. Unliking/unfollowing afterwards doesn't retract one
  // either — that's just a matter of the routes above only ever calling
  // this from their "create" branch, never their "delete" branch.
  if (recipientId === actorId) return;

  await prisma.notification.create({
    data: {
      recipientId,
      actorId,
      type,
      postId: postId ?? null,
      commentId: commentId ?? null,
      commentText: commentText ?? null,
    },
  });
}

// Shape this file needs from a Prisma Notification row — hand-rolled,
// same convention as lib/comments.ts's CommentRecord and lib/posts.ts's
// PostRecord, so this has no compile-time dependency on the generated
// client beyond the enum import above.
export type NotificationRecord = {
  id: string;
  type: PrismaNotificationType;
  postId: string | null;
  commentText: string | null;
  read: boolean;
  createdAt: Date;
  actor: { username: string; avatarSrc: string };
};

// Maps the Prisma enum + nullable columns onto the frontend's
// discriminated union (types/notification.ts). Each Prisma NotificationType
// always carries the fields its corresponding case needs — enforced by
// createNotification's callers below, not by anything in the schema —
// so a malformed row (e.g. a LIKE with no postId) is a bug elsewhere,
// not something this needs to defend against by returning null.
function serializeOne(row: NotificationRecord): Notification {
  const base = {
    id: row.id,
    actor: row.actor,
    createdAt: row.createdAt.toISOString(),
    read: row.read,
  };

  switch (row.type) {
    case PrismaNotificationType.LIKE:
      return { ...base, type: "like", postId: row.postId! };
    case PrismaNotificationType.COMMENT:
      return {
        ...base,
        type: "comment",
        postId: row.postId!,
        commentText: row.commentText ?? "",
      };
    case PrismaNotificationType.FOLLOW:
      return { ...base, type: "follow" };
    case PrismaNotificationType.REPLY:
      return {
        ...base,
        type: "reply",
        postId: row.postId!,
        commentText: row.commentText ?? "",
      };
    case PrismaNotificationType.COMMENT_LIKE:
      return { ...base, type: "comment_like", postId: row.postId! };
    default: {
      // Exhaustiveness guard — every PrismaNotificationType member is
      // handled above; this only fires if a new one is ever added to
      // the schema without a matching case here.
      const _exhaustive: never = row.type;
      throw new Error(`Unhandled notification type: ${_exhaustive}`);
    }
  }
}

export function serializeNotifications(
  rows: NotificationRecord[],
): Notification[] {
  return rows.map(serializeOne);
}

// Shared by GET /api/notifications and the SSR prefetch
// (lib/serverQueries.ts's fetchNotificationsForSSR) — one definition of
// "a user's notification list" so the two can never drift (e.g. one
// forgetting the `take` cap or the actor `select`).
export async function getNotificationsForUser(
  userId: string,
): Promise<Notification[]> {
  const rows = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: MAX_NOTIFICATIONS,
    include: {
      actor: { select: { username: true, avatarSrc: true } },
    },
  });

  return serializeNotifications(rows);
}
