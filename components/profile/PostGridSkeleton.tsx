export function PostGridSkeleton() {
  return (
    <div
      className="grid animate-pulse grid-cols-3 gap-0.5"
      role="status"
      aria-label="Loading posts"
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="aspect-square bg-foreground/10" />
      ))}
    </div>
  );
}
