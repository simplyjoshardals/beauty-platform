// Stable identity key for the logged-in user — never changes, even if
// they edit their username later. Every "is this mine" check (isOwnPost,
// self-mention, self-follow exclusion, etc.) compares against THIS, never
// against username — username is a mutable display field (see
// ProfileProvider), so comparing by it would silently break the moment
// someone renamed themselves. This mirrors how the real schema keys every
// relation by id, never by username.
export const CURRENT_USER_ID = "current-user";