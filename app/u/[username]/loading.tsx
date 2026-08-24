import { ProfileHeaderSkeleton } from "@/components/profile/ProfileHeaderSkeleton";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";

export default function UserProfileLoading() {
  return (
    <div className="flex flex-col">
      <ProfileHeaderSkeleton />
      <div className="border-t border-foreground/10">
        <PostGridSkeleton />
      </div>
    </div>
  );
}
