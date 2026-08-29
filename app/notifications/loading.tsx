import { NotificationsListSkeleton } from "@/components/notifications/NotificationsListSkeleton";
import { NotificationsHeader } from "@/components/notifications/NotificationsHeader";

// Next's file-based streaming convention: shown automatically while
// app/notifications/page.tsx's async Server Component (the SSR fetch +
// prefetch) is still resolving, then swapped for the real page. Shares
// NotificationsHeader with the real page so there's no layout shift
// between this and the real content taking over.
export default function NotificationsLoading() {
  return (
    <div className="flex flex-col">
      <NotificationsHeader />
      <NotificationsListSkeleton />
    </div>
  );
}
