export default function UserNotFound() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="text-base font-medium">User not found</p>
      <p className="text-sm text-foreground/50">
        This account doesn&rsquo;t exist, or the link is incorrect.
      </p>
    </div>
  );
}
