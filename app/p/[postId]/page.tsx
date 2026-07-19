import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockPosts } from "@/data/mockPosts";
import { PostCard } from "@/components/feed/PostCard";
import { getPostThumbnail } from "@/utils/postThumbnail";

type Props = {
  params: Promise<{ postId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = mockPosts.find((p) => p.id === postId);
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
  const post = mockPosts.find((p) => p.id === postId);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-dvh">
      <PostCard post={post} />
    </div>
  );
}
