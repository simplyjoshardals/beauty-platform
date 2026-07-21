"use client";

import Image from "next/image";
import Link from "next/link";
import { useFollow } from "@/context/FollowProvider";
import { getRelativeTime } from "@/utils/time";
import { PATHS } from "@/utils/paths";
import type { Notification } from "@/types/notification";

function getMessage(notification: Notification): string {
  switch (notification.type) {
    case "like":
      return "liked your post";
    case "comment":
      return `commented: "${notification.commentText}"`;
    case "follow":
      return "started following you";
    case "reply":
      return `replied to your comment: "${notification.commentText}"`;
  }
}

function getHref(notification: Notification): string {
  switch (notification.type) {
    case "follow":
      return PATHS.USER_PROFILE(notification.actor.username);
    case "like":
    case "comment":
    case "reply":
      return PATHS.POST(notification.postId);
  }
}

export function NotificationRow({
  notification,
}: {
  notification: Notification;
}) {
  const { isFollowing, toggleFollow } = useFollow();
  const following =
    notification.type === "follow"
      ? isFollowing(notification.actor.username)
      : false;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${
        notification.read ? "" : "bg-foreground/3"
      }`}
    >
      {!notification.read && (
        <span
          className="size-2 shrink-0 rounded-full bg-blue-500"
          aria-hidden
        />
      )}

      <Link
        href={getHref(notification)}
        className="flex flex-1 items-center gap-3"
      >
        <Image
          src={notification.actor.avatarSrc}
          alt={notification.actor.username}
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full object-cover"
        />
        <div className="flex-1 text-sm leading-snug">
          <span className="font-medium">{notification.actor.username}</span>{" "}
          <span className="text-foreground/80">{getMessage(notification)}</span>
          <div className="mt-0.5 text-xs text-foreground/40">
            {getRelativeTime(notification.createdAt)}
          </div>
        </div>
      </Link>

      {notification.type === "follow" && (
        <button
          type="button"
          onClick={() => toggleFollow(notification.actor.username)}
          className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            following
              ? "border border-foreground/15 text-foreground"
              : "bg-foreground text-background"
          }`}
        >
          {/* This IS a "so-and-so followed you" notification, so if you
              haven't followed back yet, it's always a follow-back —
              no need to cross-check the mock followers list here. */}
          {following ? "Following" : "Follow back"}
        </button>
      )}
    </div>
  );
}
