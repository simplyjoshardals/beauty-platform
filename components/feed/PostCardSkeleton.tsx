export function PostCardSkeleton() {
  return (
    <div className="animate-pulse border-b border-foreground/10">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="size-9 rounded-full bg-foreground/10" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-24 rounded bg-foreground/10" />
          <div className="h-2.5 w-16 rounded bg-foreground/10" />
        </div>
      </div>

      <div className="aspect-square w-full bg-foreground/10" />

      <div className="flex gap-2 px-3 py-2">
        <div className="h-6 w-28 rounded-full bg-foreground/10" />
        <div className="h-6 w-24 rounded-full bg-foreground/10" />
      </div>

      <div className="flex items-center gap-4 px-3 py-2">
        <div className="h-5 w-10 rounded bg-foreground/10" />
        <div className="h-5 w-10 rounded bg-foreground/10" />
        <div className="h-5 w-5 rounded bg-foreground/10" />
        <div className="ml-auto h-5 w-5 rounded bg-foreground/10" />
      </div>

      <div className="flex flex-col gap-1.5 px-3 pb-3">
        <div className="h-3 w-full rounded bg-foreground/10" />
        <div className="h-3 w-2/3 rounded bg-foreground/10" />
      </div>

      <div className="px-3 pb-3">
        <div className="h-2.5 w-16 rounded bg-foreground/10" />
      </div>
    </div>
  );
}
