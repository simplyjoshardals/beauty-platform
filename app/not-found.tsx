export default function PostNotFound() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="text-base font-medium">Post not found</p>
      <p className="text-sm text-foreground/50">
        This post may have been removed, or the link is incorrect.
      </p>
    </div>
  );
}
