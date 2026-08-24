// Next wraps every route segment's page.tsx (and any child segments
// below it that don't provide their own loading.tsx) in a Suspense
// boundary tied to that segment's loading.tsx. Without a file here,
// navigating into /saved/[collectionId] fell through to the nearest
// ancestor — app/saved/loading.tsx, the collections-grid skeleton —
// and Next still briefly shows it during the client-side RSC fetch for
// the new segment, even though this page does no async work of its own
// to actually wait on.
//
// This file exists purely to "claim" that boundary back for this
// segment, not to show a fallback: it renders nothing, since
// SavedCollectionContent's own isLoading branch (PostGridSkeleton)
// already covers the one case where there's genuinely nothing in the
// cache yet — a direct hit or hard refresh with a cold client cache.
// For the normal path (clicking a tile from /saved, where the data's
// already hydrated), there's nothing to wait on at all, so this never
// visibly renders.
export default function SavedCollectionLoading() {
  return null;
}