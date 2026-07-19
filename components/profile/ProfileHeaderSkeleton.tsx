export function ProfileHeaderSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 px-4 py-5">
      <div className="flex items-center gap-5">
        <div className="size-20 shrink-0 rounded-full bg-foreground/10" />
        <div className="flex flex-1 justify-around">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="h-4 w-8 rounded bg-foreground/10" />
              <div className="h-2.5 w-12 rounded bg-foreground/10" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="h-3 w-24 rounded bg-foreground/10" />
        <div className="h-3 w-full rounded bg-foreground/10" />
        <div className="h-3 w-2/3 rounded bg-foreground/10" />
      </div>

      <div className="h-9 w-full rounded-lg bg-foreground/10" />
    </div>
  );
}
