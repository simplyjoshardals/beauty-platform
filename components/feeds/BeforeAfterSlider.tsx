"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type MediaItem = { src: string; alt: string };

export function BeforeAfterSlider({
  before,
  after,
}: {
  before: MediaItem;
  after: MediaItem;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50); // % of "after" revealed from the left

  function updateFromClientX(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full touch-none select-none overflow-hidden"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons !== 1) return;
        updateFromClientX(e.clientX);
      }}
    >
      {/* Base layer: after */}
      <Image src={after.src} alt={after.alt} fill className="object-cover" />

      {/* Clipped layer: before — clip-path avoids resizing/distortion issues
          that come from animating width on a nested `fill` image */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={before.src}
          alt={before.alt}
          fill
          className="object-cover"
        />
      </div>

      {/* Drag handle */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white"
        style={{ left: `${position}%` }}
      >
        <div className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs shadow">
          ↔
        </div>
      </div>

      <span className="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
        Before
      </span>
      <span className="absolute right-2 top-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
        After
      </span>
    </div>
  );
}
