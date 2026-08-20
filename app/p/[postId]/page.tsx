import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializePost, postInclude } from "@/lib/posts";
import { PostCard } from "@/components/feed/PostCard";
import { getPostThumbnail } from "@/utils/postThumbnail";

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

export default async function SinglePostPage({ params }: Props) {
  const { postId } = await params;
  const post = await getPost(postId);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-dvh">
      <PostCard post={post} />
    </div>
  );
}
