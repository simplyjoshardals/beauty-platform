import { HomeFeed } from "@/components/feed/HomeFeed";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function HomeFeedPage() {
  return (
    <RequireAuth message="Sign in to see posts from people you follow.">
      <div className="min-h-dvh">
        <HomeFeed />
      </div>
    </RequireAuth>
  );
}
