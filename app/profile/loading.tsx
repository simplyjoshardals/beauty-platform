import { ProfileHeaderSkeleton } from "@/components/profile/ProfileHeaderSkeleton";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";

export default function ProfileLoading() {
  return (
    <div className="flex flex-col">
      <ProfileHeaderSkeleton />
      <div className="animate-pulse border-t border-foreground/10 px-4 py-4">
        <div className="mb-2 h-3.5 w-16 rounded bg-foreground/10" />
        <div className="flex gap-2">
          <div className="h-7 w-28 shrink-0 rounded-full bg-foreground/10" />
          <div className="h-7 w-24 shrink-0 rounded-full bg-foreground/10" />
        </div>
      </div>
      <div className="border-t border-foreground/10">
        <PostGridSkeleton />
      </div>
    </div>
  );
}
