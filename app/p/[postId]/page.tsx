import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { prisma } from "@/lib/prisma";
import { serializePost, postInclude } from "@/lib/posts";
import { PostCard } from "@/components/feed/PostCard";
import { getPostThumbnail } from "@/utils/postThumbnail";
import { getServerUserId } from "@/lib/session";
import {
  fetchLikedPostIdsForSSR,
  fetchSavedBundleForSSR,
  fetchUserProfileForSSR,
} from "@/lib/serverQueries";
import {
  LIKES_QUERY_KEY,
  SAVED_QUERY_KEY,
  profileQueryKey,
} from "@/lib/queryKeys";

type Props = {
  params: Promise<{ postId: string }>;
};

// Same query GET /api/posts/[postId] runs (same postInclude/serializePost
// from lib/posts.ts), called directly here rather than as an HTTP
// self-fetch — this is itself the server rendering the page, so there's
// no separate server to round-trip to. Shared by generateMetadata and
// the page body below so a not-found post behaves identically in both
// (see the API route's own comment for why this is deliberately public:
// unauthenticated visitors load this page directly).
async function getPost(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: postInclude,
  });
  return post ? serializePost(post) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = await getPost(postId);
  if (!post) return {};

  const title = `${post.author.username} on Vanity`;
  const image = getPostThumbnail(post);

  return {
    title,
    description: post.caption,
    openGraph: {
      title,
      description: post.caption,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

// Same SSR-prefetch shape as app/(home)/page.tsx, app/u/[username]/page.tsx,
// and app/saved/page.tsx: everything PostCard needs on first paint —
// the post itself (already fetched above via getPost), whether the
// viewer has liked/saved it, and the author's follow state — is
// resolved server-side and dehydrated into the HydrationBoundary below,
// instead of PostCard's hooks (useLikedPosts/useSavedPosts/
// useUserProfile) each firing their own client-side fetch on mount.
// LIKES_QUERY_KEY and SAVED_QUERY_KEY are the same app-wide keys the
// home feed prefetches into — this just warms the same cache from a
// different entry point, so navigating from here to /saved or /home
// afterward doesn't re-fetch either. The author's profile is fetched
// directly (fetchUserProfileForSSR) rather than via the home page's
// batch helper, since there's only ever one author to look up here.
export default async function SinglePostPage({ params }: Props) {
  const { postId } = await params;

  const [post, userId] = await Promise.all([
    getPost(postId),
    getServerUserId(),
  ]);

  if (!post) {
    notFound();
  }

  const queryClient = new QueryClient();

  const prefetches: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: profileQueryKey(post.author.username),
      queryFn: () => fetchUserProfileForSSR(post.author.username, userId),
    }),
  ];

  if (userId) {
    prefetches.push(
      queryClient.prefetchQuery({
        queryKey: LIKES_QUERY_KEY,
        queryFn: async () => ({
          likedPostIds: await fetchLikedPostIdsForSSR(userId),
        }),
      }),
      queryClient.prefetchQuery({
        queryKey: SAVED_QUERY_KEY,
        queryFn: () => fetchSavedBundleForSSR(userId),
      }),
    );
  }

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-dvh">
        <PostCard post={post} />
      </div>
    </HydrationBoundary>
  );
}
