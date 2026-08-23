import { HomeFeedSkeleton } from "@/components/feed/HomeFeedSkeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-dvh">
      <HomeFeedSkeleton />
    </div>
  );
}
