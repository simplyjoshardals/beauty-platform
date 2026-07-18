import { PostCardSkeleton } from "./PostCardSkeleton";

export function HomeFeedSkeleton() {
  return (
    <div className="flex flex-col" role="status" aria-label="Loading posts">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
