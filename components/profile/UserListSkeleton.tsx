import { UserListRowSkeleton } from "./UserListRowSkeleton";

export function UserListSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      {Array.from({ length: 6 }).map((_, i) => (
        <UserListRowSkeleton key={i} />
      ))}
    </div>
  );
}
