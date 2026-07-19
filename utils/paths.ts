export const PATHS = {
  HOME: "/",
  EXPLORE: "/explore",
  SAVED: "/saved",
  NOTIFICATIONS: "/notifications",
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",
  FOLLOWERS: "/profile/followers",
  FOLLOWING: "/profile/following",
  CREATE_POST: "/create",
  POST: (postId: string) => `/p/${postId}`,
};
