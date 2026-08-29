"use client";

import Image from "next/image";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthGatedAction } from "@/hooks/useAuthGatedAction";
import { AuthGateModal } from "@/components/auth/AuthGateModal";
import { followLabel } from "@/utils/followLabel";
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
    case "comment_like":
      return "liked your comment";
  }
}

function getHref(notification: Notification): string {
  switch (notification.type) {
    case "follow":
      return PATHS.USER_PROFILE(notification.actor.username);
    case "like":
    case "comment":
    case "reply":
    case "comment_like":
      return PATHS.POST(notification.postId);
  }
}

export function NotificationRow({
  notification,
  unread,
}: {
  notification: Notification;
  // Whether this row should render as unread — driven by the
  // notifications page's frozen unreadIdsAtOpen snapshot, NOT
  // notification.read directly. That field gets optimistically flipped
  // to true the instant the page mounts (see
  // app/notifications/page.tsx), so reading it here would make the
  // unread dot/highlight disappear out from under the person while
  // they're still looking at the list.
  unread: boolean;
}) {
  // Same real Follow-table backend PostCard/ProfileHeader/UserListRow
  // use. Only "follow" notifications need a follow button at all, so
  // the fetch is disabled for every other notification type — no point
  // asking for the actor's profile just to render a like/comment row.
  const { user: actorProfile, toggleFollow } = useUserProfile(
    notification.actor.username,
    { enabled: notification.type === "follow" },
  );
  const { gateOpen, gateMessage, closeGate, guard } = useAuthGatedAction();
  const isFollowing = actorProfile?.isFollowing ?? false;
  const followsMe = actorProfile?.followsMe ?? true; // this notification IS them following us
  const label = followLabel(isFollowing, followsMe);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${
        unread ? "bg-foreground/3" : ""
      }`}
    >
      {unread && (
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
          onClick={guard(toggleFollow)}
          className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            isFollowing
              ? "border border-foreground/15 text-foreground"
              : "bg-foreground text-background"
          }`}
        >
          {label}
        </button>
      )}

      <AuthGateModal
        open={gateOpen}
        onClose={closeGate}
        message={gateMessage}
      />
    </div>
  );
}
