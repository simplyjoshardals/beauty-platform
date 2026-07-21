import Link from "next/link";
import Image from "next/image";
import { PATHS } from "@/utils/paths";

type Props = {
  id: string;
  name: string;
  coverSrc?: string;
  count: number;
};

export function CollectionTile({ id, name, coverSrc, count }: Props) {
  return (
    <Link
      href={PATHS.SAVED_COLLECTION(id)}
      className="relative aspect-square overflow-hidden rounded-lg bg-foreground/5"
    >
      {coverSrc && (
        <Image
          src={coverSrc}
          alt=""
          fill
          unoptimized
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2">
        <p className="truncate text-xs font-medium text-white">{name}</p>
        <p className="text-[10px] text-white/70">
          {count} {count === 1 ? "post" : "posts"}
        </p>
      </div>
    </Link>
  );
}
