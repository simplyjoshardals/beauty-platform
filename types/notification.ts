type BaseNotification = {
  id: string;
  actor: { username: string; avatarSrc: string };
  createdAt: string;
  read: boolean;
};

// Discriminated on `type` — follow has no post to link to; like/comment/
// reply/comment_like all do, and comment/reply also carry a text
// snippet to preview (comment_like doesn't preview the liked comment's
// text, same as like doesn't preview the post).
export type Notification =
  | (BaseNotification & { type: "like"; postId: string })
  | (BaseNotification & {
      type: "comment";
      postId: string;
      commentText: string;
    })
  | (BaseNotification & { type: "follow" })
  | (BaseNotification & { type: "reply"; postId: string; commentText: string })
  | (BaseNotification & { type: "comment_like"; postId: string });
