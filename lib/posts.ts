import type { Post, PostMedia } from "@/types/post";

// Mirrors the MediaType enum in prisma/schema.prisma exactly — kept as a
// plain object (not imported from the generated client) so this file has
// no dependency on `prisma generate` having been run.
export const MEDIA_TYPES = [
  "IMAGE",
  "CAROUSEL",
  "VIDEO",
  "BEFORE_AFTER",
] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

// Shape this file needs from a Prisma Post row — deliberately hand-rolled
// rather than `Prisma.PostGetPayload<...>` so serializePost has no
// compile-time dependency on the generated client either.
export type PostRecord = {
  id: string;
  authorId: string;
  mediaType: string;
  imageSrc: string | null;
  imageAlt: string | null;
  videoSrc: string | null;
  videoPoster: string | null;
  beforeSrc: string | null;
  beforeAlt: string | null;
  afterSrc: string | null;
  afterAlt: string | null;
  caption: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    avatarSrc: string;
    toneTag: string;
  };
  carouselItems: { id: string; src: string; alt: string; order: number }[];
  products: { id: string; label: string }[];
  _count: { likes: number; comments: number };
};

function buildMedia(post: PostRecord): PostMedia {
  switch (post.mediaType) {
    case "IMAGE":
      return {
        id: post.id,
        type: "image",
        src: post.imageSrc ?? "",
        alt: post.imageAlt ?? "",
      };
    case "CAROUSEL":
      return {
        id: post.id,
        type: "carousel",
        items: [...post.carouselItems]
          .sort((a, b) => a.order - b.order)
          .map((item) => ({ src: item.src, alt: item.alt })),
      };
    case "VIDEO":
      return {
        id: post.id,
        type: "video",
        src: post.videoSrc ?? "",
        poster: post.videoPoster ?? "",
      };
    case "BEFORE_AFTER":
      return {
        id: post.id,
        type: "before_after",
        before: { src: post.beforeSrc ?? "", alt: post.beforeAlt ?? "" },
        after: { src: post.afterSrc ?? "", alt: post.afterAlt ?? "" },
      };
    default:
      // Shouldn't happen — mediaType is validated on the way in — but
      // fall back to something renderable rather than throwing mid-list.
      return { id: post.id, type: "image", src: "", alt: "" };
  }
}

// Shared shape for both GET (list) and POST (create) responses — a post
// a person just created should look identical to one they'd get back
// from a subsequent list fetch.
export function serializePost(post: PostRecord): Post {
  return {
    id: post.id,
    author: {
      id: post.author.id,
      username: post.author.username,
      avatarSrc: post.author.avatarSrc,
      toneTag: post.author.toneTag || undefined,
    },
    media: buildMedia(post),
    products:
      post.products.length > 0
        ? post.products.map((p) => ({ id: p.id, label: p.label }))
        : undefined,
    caption: post.caption,
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    createdAt: post.createdAt.toISOString(),
  };
}

// Same "did this URL actually come from our own signed upload flow"
// check that /api/user/me and /api/user/onboarding already apply to
// avatarSrc — a post's media URLs need the same guard, just pointed at
// the post-media folders instead of vanity/avatars.
export function isValidCloudinaryUrl(url: unknown, folder: string): boolean {
  return (
    typeof url === "string" &&
    url.length > 0 &&
    url.includes(`res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`) &&
    url.includes(`/${folder}/`)
  );
}

// Shared between GET (list), GET (single post), and POST (create) — a
// post returned from any of the three needs the exact same shape, so
// callers can drop any of them into the same cache/array without a
// reshape. Kept as a plain object (no generated-Prisma-client import)
// for the same decoupling reason as MEDIA_TYPES above; Prisma's
// `include` option just needs the right shape, not the actual enum type.
export const postInclude = {
  author: true,
  carouselItems: true,
  products: true,
  _count: { select: { likes: true, comments: true } },
} as const;

export const POST_IMAGE_FOLDER = "vanity/posts/images";
export const POST_VIDEO_FOLDER = "vanity/posts/videos";

export const MAX_CAPTION_LENGTH = 2200; // matches Instagram's own limit
export const MAX_PRODUCT_LABEL_LENGTH = 120;
export const MAX_PRODUCTS_PER_POST = 20;
export const MAX_CAROUSEL_ITEMS = 10;
