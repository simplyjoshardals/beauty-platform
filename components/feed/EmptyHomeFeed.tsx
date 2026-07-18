import Link from "next/link";
import { UsersThreeIcon } from "@phosphor-icons/react";

export function EmptyHomeFeed() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-foreground/5">
        <UsersThreeIcon size={28} className="text-foreground/40" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Nothing here yet</p>
        <p className="text-sm text-foreground/50">
          Follow a few accounts to start seeing their posts here.
        </p>
      </div>
      <Link
        href="/explore"
        className="mt-2 rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium"
      >
        Find people to follow
      </Link>
    </div>
  );
}
