import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MediaType as PrismaMediaType } from "@/lib/generated/prisma/client";
import {
  serializePost,
  postInclude,
  isValidCloudinaryUrl,
  getHomeFeedPosts,
  POST_IMAGE_FOLDER,
  POST_VIDEO_FOLDER,
  MAX_CAPTION_LENGTH,
  MAX_PRODUCT_LABEL_LENGTH,
  MAX_PRODUCTS_PER_POST,
  MAX_CAROUSEL_ITEMS,
} from "@/lib/posts";
import { getCloudinaryVideoThumbnail } from "@/utils/cloudinaryVideoThumbnail";

// x-user-id is set by proxy.ts. GET /api/posts is a protected route (see
// proxy.ts's isProtectedRoute/isPublicGet — the feed list itself is
// never public), so by the time a request reaches here proxy has already
// enforced a hard 401 for a missing/invalid session; the check below is
// just defense in depth, not the primary gate.
//
// v1 home feed algorithm lives in getHomeFeedPosts (lib/posts.ts): your
// own posts + everyone you follow, newest first — filtered in the WHERE
// clause instead of the client fetching every post and filtering
// against a separately-fetched following list (what HomeFeed used to
// do).
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const posts = await getHomeFeedPosts(userId);

  return NextResponse.json({ success: true, posts });
}

type ProductInput = { label: string };

function validateProducts(input: unknown): ProductInput[] | { error: string } {
  if (input === undefined) return [];
  if (!Array.isArray(input)) return { error: "Invalid products." };
  if (input.length > MAX_PRODUCTS_PER_POST) {
    return { error: `You can tag up to ${MAX_PRODUCTS_PER_POST} products.` };
  }

  const products: ProductInput[] = [];
  for (const item of input) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof (item as { label?: unknown }).label !== "string"
    ) {
      return { error: "Invalid products." };
    }
    const label = (item as { label: string }).label.trim();
    if (!label || label.length > MAX_PRODUCT_LABEL_LENGTH) {
      return { error: "Invalid product label." };
    }
    products.push({ label });
  }
  return products;
}

// x-user-id is set by proxy.ts, which already validated the session
// before this route runs — same trust model as every other protected
// route (/api/user/me, /api/upload/signature, etc).
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { mediaType, caption, products: productsInput } = body;

    if (
      typeof mediaType !== "string" ||
      !Object.values(PrismaMediaType).includes(mediaType as PrismaMediaType)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid post type." },
        { status: 400 },
      );
    }

    if (caption !== undefined && typeof caption !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid caption." },
        { status: 400 },
      );
    }
    const trimmedCaption = (caption ?? "").trim();
    if (trimmedCaption.length > MAX_CAPTION_LENGTH) {
      return NextResponse.json(
        { success: false, error: "Caption is too long." },
        { status: 400 },
      );
    }

    const products = validateProducts(productsInput);
    if ("error" in products) {
      return NextResponse.json(
        { success: false, error: products.error },
        { status: 400 },
      );
    }

    // Media fields are validated per-type below — only the ones for the
    // submitted mediaType are checked/used, everything else is ignored
    // even if present in the body.
    const media = mediaType as PrismaMediaType;

    const mediaData: {
      imageSrc?: string;
      imageAlt?: string;
      videoSrc?: string;
      videoPoster?: string;
      beforeSrc?: string;
      beforeAlt?: string;
      afterSrc?: string;
      afterAlt?: string;
    } = {};
    let carouselItemsData: { src: string; alt: string; order: number }[] = [];

    if (media === "IMAGE") {
      const { imageSrc, imageAlt } = body;
      if (!isValidCloudinaryUrl(imageSrc, POST_IMAGE_FOLDER)) {
        return NextResponse.json(
          { success: false, error: "Invalid post image." },
          { status: 400 },
        );
      }
      mediaData.imageSrc = imageSrc;
      mediaData.imageAlt = typeof imageAlt === "string" ? imageAlt : "";
    } else if (media === "CAROUSEL") {
      const { carouselItems } = body;
      if (
        !Array.isArray(carouselItems) ||
        carouselItems.length < 2 ||
        carouselItems.length > MAX_CAROUSEL_ITEMS
      ) {
        return NextResponse.json(
          { success: false, error: "A carousel needs 2–10 photos." },
          { status: 400 },
        );
      }
      for (const item of carouselItems) {
        if (!isValidCloudinaryUrl(item?.src, POST_IMAGE_FOLDER)) {
          return NextResponse.json(
            { success: false, error: "Invalid carousel image." },
            { status: 400 },
          );
        }
      }
      carouselItemsData = carouselItems.map(
        (item: { src: string; alt?: string }, index: number) => ({
          src: item.src,
          alt: typeof item.alt === "string" ? item.alt : "",
          order: index,
        }),
      );
    } else if (media === "VIDEO") {
      const { videoSrc } = body;
      if (!isValidCloudinaryUrl(videoSrc, POST_VIDEO_FOLDER)) {
        return NextResponse.json(
          { success: false, error: "Invalid post video." },
          { status: 400 },
        );
      }
      mediaData.videoSrc = videoSrc;
      // Always derived server-side from videoSrc, never taken from the
      // request body — it's a pure transform of a URL we already
      // validated above, so there's nothing for the client to get wrong
      // (or skip sending) and no separate upload/model field to keep in
      // sync with it.
      mediaData.videoPoster = getCloudinaryVideoThumbnail(videoSrc);
    } else if (media === "BEFORE_AFTER") {
      const { beforeSrc, beforeAlt, afterSrc, afterAlt } = body;
      if (
        !isValidCloudinaryUrl(beforeSrc, POST_IMAGE_FOLDER) ||
        !isValidCloudinaryUrl(afterSrc, POST_IMAGE_FOLDER)
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid before/after photos." },
          { status: 400 },
        );
      }
      mediaData.beforeSrc = beforeSrc;
      mediaData.beforeAlt =
        typeof beforeAlt === "string" ? beforeAlt : "Before";
      mediaData.afterSrc = afterSrc;
      mediaData.afterAlt = typeof afterAlt === "string" ? afterAlt : "After";
    }

    const post = await prisma.post.create({
      data: {
        authorId: userId,
        mediaType: media,
        caption: trimmedCaption,
        ...mediaData,
        ...(carouselItemsData.length > 0
          ? { carouselItems: { create: carouselItemsData } }
          : {}),
        ...(products.length > 0 ? { products: { create: products } } : {}),
      },
      include: postInclude,
    });

    return NextResponse.json({ success: true, post: serializePost(post) });
  } catch (err) {
    console.error("create post error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
