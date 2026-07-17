"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type MediaItem = { src: string; alt: string };

export function Carousel({ items }: { items: MediaItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex aspect-square w-full snap-x snap-mandatory overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div key={i} className="relative w-full shrink-0 snap-center">
            <Image
              src={item.src}
              alt={item.alt}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {items.map((_, i) => (
            <span
              key={i}
              className={`size-1.5 rounded-full ${i === active ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
