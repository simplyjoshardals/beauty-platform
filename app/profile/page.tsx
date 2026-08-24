import { Suspense } from "react";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { OwnProfileHeaderClient } from "@/components/profile/OwnProfileHeaderClient";
import { PostGridSection } from "@/components/profile/PostGridSection";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CURRENT_USER_QUERY_KEY } from "@/lib/queryKeys";
import { getServerUserId } from "@/lib/session";
import { fetchCurrentUserForSSR } from "@/lib/serverQueries";

// Mirrors app/(home)/page.tsx's SSR-prefetch pattern, but streamed
// rather than fully blocking: currentUser (now including a real
// postCount via _count — see lib/users.ts) is cheap enough to await
// before rendering anything, so OwnProfileHeaderClient renders with
// real data on first paint. The heavier posts-with-media query —
// previously fetched client-side after mount, which is what left the
// post count at 0 and the grid empty for a beat after the header had
// already shown — now runs inside PostGridSection, wrapped in Suspense,
// so it streams in behind the header instead of either blocking it or
// loading client-side.
//
// currentUser itself is also prefetched once in app/layout.tsx for the
// shared chrome (BottomNav etc.) — fetchCurrentUserForSSR is wrapped in
// React's cache(), so calling it again here for the same userId within
// the same request dedupes to that one DB hit, not a second one.
export default async function ProfilePage() {
  const userId = await getServerUserId();
  const queryClient = new QueryClient();

  if (!userId) {
    // No session: RequireAuth below is what actually gates this page —
    // nothing to prefetch for a logged-out visitor.
    return (
      <RequireAuth>
        <ProfilePageContent username={undefined} />
      </RequireAuth>
    );
  }

  const currentUser = await fetchCurrentUserForSSR(userId);

  await queryClient.prefetchQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => currentUser,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequireAuth>
        <ProfilePageContent username={currentUser?.username} />
      </RequireAuth>
    </HydrationBoundary>
  );
}

function ProfilePageContent({ username }: { username: string | undefined }) {
  return (
    <div className="flex flex-col">
      <OwnProfileHeaderClient />
      <div className="border-t border-foreground/10">
        {username ? (
          <Suspense fallback={<PostGridSkeleton />}>
            <PostGridSection username={username} />
          </Suspense>
        ) : (
          // userId pointed at a session with no matching user row —
          // same edge case the pre-split page silently sat in forever;
          // not something this pass changes the behavior of.
          <PostGridSkeleton />
        )}
      </div>
    </div>
  );
}
