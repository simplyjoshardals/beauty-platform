import { HomeFeed } from "@/components/feed/HomeFeed";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function HomeFeedPage() {
  return (
    <RequireAuth>
      <div className="min-h-dvh">
        <HomeFeed />
      </div>
    </RequireAuth>
  );
}
