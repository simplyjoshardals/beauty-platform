import { CommentItemSkeleton } from "./CommentItemSkeleton";

export function CommentSheetSkeleton() {
  return (
    <div role="status" aria-label="Loading comments">
      {Array.from({ length: 4 }).map((_, i) => (
        <CommentItemSkeleton key={i} />
      ))}
    </div>
  );
}
