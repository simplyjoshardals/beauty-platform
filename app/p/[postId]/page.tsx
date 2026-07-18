// import type { Metadata } from "next";
// import { notFound } from "next/navigation";
// import { mockPosts } from "@/data/mockPosts";
// import { PostCard } from "@/components/feed/PostCard";
// import type { Post } from "@/types/post";

// type Props = {
//   params: Promise<{ postId: string }>;
// };

// // Best available preview image per media type — used for the og:image
// // that shows up in link previews (WhatsApp, X, iMessage, etc).
// function getPreviewImage(post: Post): string | undefined {
//   switch (post.media.type) {
//     case "image":
//       return post.media.src;
//     case "carousel":
//       return post.media.items[0]?.src;
//     case "video":
//       return post.media.poster;
//     case "before_after":
//       return post.media.after.src;
//   }
// }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { postId } = await params;
//   const post = mockPosts.find((p) => p.id === postId);
//   if (!post) return {};

//   const title = `${post.author.username} on Vanity`;
//   const image = getPreviewImage(post);

//   return {
//     title,
//     description: post.caption,
//     openGraph: {
//       title,
//       description: post.caption,
//       images: image ? [{ url: image }] : undefined,
//     },
//   };
// }

// export default async function SinglePostPage({ params }: Props) {
//   const { postId } = await params;
//   const post = mockPosts.find((p) => p.id === postId);

//   if (!post) {
//     notFound();
//   }

//   return (
//     <div className="min-h-dvh">
//       <PostCard post={post} />
//     </div>
//   );
// }

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
