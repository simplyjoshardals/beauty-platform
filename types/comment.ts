export type Comment = {
  id: string;
  author: { id: string; username: string; avatarSrc: string };
  text: string;
  likeCount: number;
  createdAt: string;
  replies?: Comment[]; // one level deep only — a reply's own `replies` is never read
  // When true, the comment's content is hidden and a minimal "[deleted]"
  // placeholder renders instead — but the object (and its replies) stays
  // in place so the thread structure doesn't break.
  deleted?: boolean;
};
