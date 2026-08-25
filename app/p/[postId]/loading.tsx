import { PostCardSkeleton } from "@/components/feed/PostCardSkeleton";

// SinglePostPage (./page.tsx) is an async server component — it awaits
// getPost() plus the likes/saved/profile prefetches before it can render
// anything. Next ties every route segment's page.tsx to a Suspense
// boundary keyed off that segment's loading.tsx, so without this file
// clicking into a post just sat on the previous screen until all of
// that resolved. This claims the boundary so the skeleton shows
// immediately on navigation instead. Mirrors page.tsx's own
// `min-h-dvh` wrapper around PostCard so there's no layout shift once
// the real post swaps in.
export default function PostLoading() {
  return (
    <div className="min-h-dvh">
      <PostCardSkeleton />
    </div>
  );
}
