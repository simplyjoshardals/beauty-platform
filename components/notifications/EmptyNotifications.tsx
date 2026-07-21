import { BellIcon } from "@phosphor-icons/react";

export function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-foreground/5">
        <BellIcon size={28} className="text-foreground/40" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">No notifications yet</p>
        <p className="text-sm text-foreground/50">
          Likes, comments, and follows will show up here.
        </p>
      </div>
    </div>
  );
}
