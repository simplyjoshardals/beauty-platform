import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { SearchBarSkeleton } from "@/components/profile/SearchBarSkeleton";

// Mirrors ExploreFeed's own search bar markup (see SearchBarSkeleton)
// so there's no layout shift when the real input mounts — this shell
// renders before ExploreFeed's client-side state exists.
export default function ExploreLoading() {
  return (
    <div className="min-h-dvh">
      <SearchBarSkeleton />
      <PostGridSkeleton />
    </div>
  );
}
