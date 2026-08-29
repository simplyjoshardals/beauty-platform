import { apiFetch } from "@/utils/apiClient";
import { API_ROUTES } from "@/utils/apiRoutes";
import type { Notification } from "@/types/notification";

export type NotificationsBundleResult =
  | { success: true; notifications: Notification[] }
  | { success: false; error: string };

export async function getNotifications(): Promise<NotificationsBundleResult> {
  // authRequired: false — same reasoning as authService.getCurrentUser:
  // this runs from BottomNav on every page (including /auth) whether or
  // not anyone's logged in. Without this, a logged-out visit to /auth
  // gets a 401 here, apiFetch tries to refresh, that 401s too (no
  // refresh token either), and the resulting redirect back to /auth
  // remounts BottomNav and fires this same request again — an infinite
  // refresh-token/reload loop.
  return apiFetch(API_ROUTES.NOTIFICATIONS.LIST, {
    method: "GET",
    authRequired: false,
  });
}

export type MarkAllNotificationsReadResult =
  | { success: true }
  | { success: false; error: string };

export async function markAllNotificationsRead(): Promise<MarkAllNotificationsReadResult> {
  return apiFetch(API_ROUTES.NOTIFICATIONS.READ_ALL, { method: "PATCH" });
}
