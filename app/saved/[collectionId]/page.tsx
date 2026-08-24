import { RequireAuth } from "@/components/auth/RequireAuth";
import { SavedCollectionContent } from "@/components/saved/SavedCollectionContent";

type Props = {
  params: Promise<{ collectionId: string }>;
};

// Deliberately NOT async in the data-fetching sense (no await, no
// prefetchQuery, no HydrationBoundary) — unlike app/saved/page.tsx.
// This route's entire data need is the exact same SAVED_QUERY_KEY
// bundle /saved already fetched and hydrated into the client cache;
// there is no separate per-collection query to run.
//
// The previous version re-ran fetchSavedBundleForSSR here on every
// click into a collection — same data, freshly re-queried from the DB
// for no reason, and because that's an await in an async Server
// Component, Next suspended on it and showed loading.tsx during the
// round-trip. That happened regardless of the client already having
// the identical data: the RSC render and the browser's React Query
// cache are two separate things, and a fresh server render can't see
// what's already hydrated client-side. Not being async here means
// there's nothing for Next to suspend on, so this renders instantly and
// SavedCollectionContent reads straight from the cache /saved already
// populated — no flash, no skeleton, no duplicate query.
//
// Trade-off: the server-side 404 check that used to live here is gone.
// SavedCollectionContent's own client-side notFound() fallback (once
// `collections` has loaded and collectionId genuinely isn't in it)
// still covers a bad/stale link — it just resolves client-side now
// instead of on the server. That only matters for a direct hit or hard
// refresh on a bad collectionId; the normal path (clicking a tile from
// /saved) never had a bad id to begin with.
export default async function SavedCollectionPage({ params }: Props) {
  const { collectionId } = await params;

  return (
    <RequireAuth>
      <SavedCollectionContent collectionId={collectionId} />
    </RequireAuth>
  );
}
