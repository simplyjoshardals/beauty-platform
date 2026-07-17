export type Comment = {
  id: string;
  author: { username: string; avatarSrc: string };
  text: string;
  likeCount: number;
  createdAt: string;
  replies?: Comment[]; // one level deep only — a reply's own `replies` is never read
};
