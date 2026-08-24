import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";

// Route-level fallback for /saved, same role app/(home)/loading.tsx and
// app/u/[username]/loading.tsx play for their routes — shown during the
// initial navigation Suspense boundary, before the Server Component in
// page.tsx has resolved. Mirrors SavedGridContent's own header markup
// so there's no layout shift when the real content swaps in, and
// reuses PostGridSkeleton the same way SavedGridContent's internal
// `loading` branch already does.
export default function SavedLoading() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground/10 px-4 py-3">
        <p className="text-sm font-medium">Saved</p>
      </div>
      <PostGridSkeleton />
    </div>
  );
}
