export function CommentItemSkeleton() {
  return (
    <div className="flex animate-pulse gap-2 px-3 py-2">
      <div className="size-8 shrink-0 rounded-full bg-foreground/10" />
      <div className="flex flex-1 flex-col gap-1.5 pt-0.5">
        <div className="h-3 w-1/3 rounded bg-foreground/10" />
        <div className="h-3 w-4/5 rounded bg-foreground/10" />
      </div>
    </div>
  );
}
