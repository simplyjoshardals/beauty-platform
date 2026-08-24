import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { SavedGridContent } from "@/components/saved/SavedGridContent";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SAVED_QUERY_KEY } from "@/lib/queryKeys";
import { getServerUserId } from "@/lib/session";
import { fetchSavedBundleForSSR } from "@/lib/serverQueries";

// Saved's own dedicated SSR-prefetch — one query, awaited before
// anything renders, same shape as app/(home)/page.tsx's own prefetch.
// This used to also prefetch POSTS_QUERY_KEY (the home feed) so
// SavedGridContent could filter it down to saved posts client-side;
// that's gone now that fetchSavedBundleForSSR (lib/saved.ts's
// getSavedBundle) returns the actual saved Post[] directly, queried off
// the SavedPost join rather than cross-referenced against an unrelated
// feed list. That also fixes a real bug: a saved post from someone you
// don't follow used to be invisible on /saved, because it was never in
// the home feed list being filtered against.
export default async function SavedPage() {
  const userId = await getServerUserId();

  if (!userId) {
    // No session: RequireAuth below is what actually gates this page —
    // nothing to prefetch for a logged-out visitor.
    return (
      <RequireAuth>
        <SavedGridContent />
      </RequireAuth>
    );
  }

  const savedBundle = await fetchSavedBundleForSSR(userId);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: SAVED_QUERY_KEY,
    queryFn: async () => savedBundle,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequireAuth>
        <SavedGridContent />
      </RequireAuth>
    </HydrationBoundary>
  );
}
