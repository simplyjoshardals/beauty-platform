// Static — no data needed — shared between app/notifications/page.tsx
// and app/notifications/loading.tsx so the two can never drift apart
// and cause a layout shift when loading.tsx hands off to the real page.
export function NotificationsHeader() {
  return (
    <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
      <p className="text-sm font-medium">Notifications</p>
    </div>
  );
}
