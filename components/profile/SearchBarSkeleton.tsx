import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";

// Matches the search bar markup shared by ExploreFeed and
// UserListWithSearch (same border-b/px-4/py-2.5 wrapper, same
// rounded-full pill, same icon) — only the input itself is swapped for
// a pulsing placeholder bar, since these render server-side, before any
// client search state exists.
export function SearchBarSkeleton() {
  return (
    <div className="border-b border-foreground/10 px-4 py-2.5">
      <div className="flex animate-pulse items-center gap-2 rounded-full bg-foreground/5 px-3 py-2">
        <MagnifyingGlassIcon size={16} className="text-foreground/40" />
        <div className="h-3.5 w-24 rounded bg-foreground/10" />
      </div>
    </div>
  );
}
