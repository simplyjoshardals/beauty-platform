import { NotificationRowSkeleton } from "./NotificationRowSkeleton";

export function NotificationsListSkeleton() {
  return (
    <div role="status" aria-label="Loading notifications">
      {Array.from({ length: 6 }).map((_, i) => (
        <NotificationRowSkeleton key={i} />
      ))}
    </div>
  );
}
