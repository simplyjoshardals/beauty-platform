export function UserListRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-4 py-2.5">
      <div className="size-11 shrink-0 rounded-full bg-foreground/10" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-3 w-28 rounded bg-foreground/10" />
      </div>
      <div className="h-7 w-20 shrink-0 rounded-lg bg-foreground/10" />
    </div>
  );
}
