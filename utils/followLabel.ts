// Single source of truth for the Follow button's label, used everywhere
// a follow relationship is rendered (PostCard, ProfileHeader,
// UserListRow, NotificationRow) so "mutual follow" reads the same way
// across the whole app instead of each spot inventing its own rule.
export function followLabel(isFollowing: boolean, followsMe: boolean): string {
  if (isFollowing && followsMe) return "Friends";
  if (isFollowing) return "Following";
  if (followsMe) return "Follow back";
  return "Follow";
}
