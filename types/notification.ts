type BaseNotification = {
  id: string;
  actor: { username: string; avatarSrc: string };
  createdAt: string;
  read: boolean;
};

// Discriminated on `type` — follow has no post to link to; like/comment/
// reply all do, and comment/reply also carry a text snippet to preview.
export type Notification =
  | (BaseNotification & { type: "like"; postId: string })
  | (BaseNotification & {
      type: "comment";
      postId: string;
      commentText: string;
    })
  | (BaseNotification & { type: "follow" })
  | (BaseNotification & { type: "reply"; postId: string; commentText: string });
