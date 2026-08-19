import type { Post } from "@/types/post";
import { getCloudinaryVideoThumbnail } from "./cloudinaryVideoThumbnail";

// Best available preview image per media type — shared between the
// single-post route's og:image and the profile grid's thumbnails, so
// they can't drift apart into two different "which image represents
// this post" answers.
export function getPostThumbnail(post: Post): string | undefined {
  switch (post.media.type) {
    case "image":
      return post.media.src;
    case "carousel":
      return post.media.items[0]?.src;
    case "video":
      return post.media.poster || getCloudinaryVideoThumbnail(post.media.src);
    case "before_after":
      return post.media.after.src;
  }
}
