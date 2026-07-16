export type ProductTag = {
  id: string;
  label: string; // e.g. "Foundation: Fenty Pro Filt'r 240" — kept as plain text for v1, no linking/e-commerce yet
};

type MediaItem = { src: string; alt: string };

export type PostMedia =
  | { id: string; type: "image"; src: string; alt: string }
  | { id: string; type: "carousel"; items: MediaItem[] }
  | { id: string; type: "video"; src: string; poster: string }
  | { id: string; type: "before_after"; before: MediaItem; after: MediaItem };

export type Post = {
  id: string;
  author: {
    username: string;
    avatarSrc: string;
    toneTag?: string; // e.g. "Combination skin" — optional, subtle, self-reported
  };
  media: PostMedia;
  products?: ProductTag[];
  caption: string;
  likeCount: number;
  commentCount: number;
  createdAt: string; // ISO — used for chronological sort
};
