export function NotificationRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-4 py-3">
      <div className="size-10 shrink-0 rounded-full bg-foreground/10" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-3 w-3/4 rounded bg-foreground/10" />
        <div className="h-2.5 w-12 rounded bg-foreground/10" />
      </div>
    </div>
  );
}
