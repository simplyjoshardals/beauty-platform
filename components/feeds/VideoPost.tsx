"use client";

import { useState } from "react";
import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";

export function VideoPost({ src, poster }: { src: string; poster: string }) {
  const [muted, setMuted] = useState(true);

  return (
    <div className="relative aspect-9/16 w-full bg-black">
      <video
        src={src}
        poster={poster}
        className="h-full w-full object-cover"
        autoPlay
        muted={muted}
        loop
        playsInline
      />
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white active:scale-90 transition-transform"
      >
        {muted ? <SpeakerSlashIcon size={16} /> : <SpeakerHighIcon size={16} />}
      </button>
    </div>
  );
}
