import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { ProfileHeaderClient } from "@/components/profile/ProfileHeaderClient";
import { PostGridSection } from "@/components/profile/PostGridSection";
import { PostGridSkeleton } from "@/components/profile/PostGridSkeleton";
import { SelfProfileRedirect } from "@/components/profile/SelfProfileRedirect";
import { profileQueryKey } from "@/lib/queryKeys";
import { getServerUserId } from "@/lib/session";
import { fetchUserProfileForSSR } from "@/lib/serverQueries";

type Props = {
  params: Promise<{ username: string }>;
};

// Two-tier SSR: the profile lookup (single indexed row, now including a
// real postCount via _count — see lib/users.ts) is awaited here, before
// anything is flushed to the client, so ProfileHeaderClient renders with
// real data on first paint AND a nonexistent username produces a true
// server-side 404 (not a client-side check-after-mount). The heavier
// posts-with-media query — author, carousel items, products, per-post
// like/comment counts — runs separately inside PostGridSection, wrapped
// in Suspense, so it streams in behind the header instead of either
// blocking it (the previous version of this page awaited both in
// parallel) or loading client-side (the version before that).
//
// The "redirect to /profile if this is you" check still has to happen
// client-side (SelfProfileRedirect) — it depends on the VIEWER's live
// useCurrentUser() session, which this Server Component doesn't (and
// shouldn't) assume matches the x-user-id on this particular request
// forever. That check resolves synchronously (currentUser is already
// hydrated globally) and doesn't block either the header or the grid.
export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const viewerId = await getServerUserId();

  const profile = await fetchUserProfileForSSR(username, viewerId);
  if (!profile) {
    notFound();
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: profileQueryKey(username),
    queryFn: async () => profile,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SelfProfileRedirect username={username}>
        <div className="flex flex-col">
          <ProfileHeaderClient username={username} />
          <div className="border-t border-foreground/10">
            <Suspense fallback={<PostGridSkeleton />}>
              <PostGridSection username={username} />
            </Suspense>
          </div>
        </div>
      </SelfProfileRedirect>
    </HydrationBoundary>
  );
}
