import { ProductTag } from "./post";

export type User = {
  username: string;
  avatarSrc: string;
  toneTag?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  pinnedRoutine?: ProductTag[];
};
