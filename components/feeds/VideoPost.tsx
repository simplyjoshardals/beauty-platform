"use client";

import { useEffect, useRef, useState } from "react";
import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { FullscreenVideoModal } from "./FullscreenVideoModal";

export function VideoPost({ src, poster }: { src: string; poster: string }) {
  const [muted, setMuted] = useState(true);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only play once the video is actually visible — otherwise it starts the
  // instant it mounts, blows past the poster before anyone scrolls to it,
  // and every video in the feed ends up playing off-screen at once.
  useEffect(() => {
    const videoEl = videoRef.current;
    const containerEl = containerRef.current;
    if (!videoEl || !containerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(containerEl);
    return () => observer.disconnect();
  }, []);

  function openFullscreen() {
    videoRef.current?.pause();
    setFullscreenOpen(true);
  }

  function handleFullscreenClose(finalTime: number) {
    setFullscreenOpen(false);
    const el = videoRef.current;
    if (el) {
      el.currentTime = finalTime;
      el.play().catch(() => {});
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative aspect-9/16 w-full bg-black"
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="h-full w-full object-cover"
          muted={muted}
          loop
          playsInline
          onClick={openFullscreen}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMuted((m) => !m);
          }}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white active:scale-90 transition-transform"
        >
          {muted ? (
            <SpeakerSlashIcon size={16} />
          ) : (
            <SpeakerHighIcon size={16} />
          )}
        </button>
      </div>

      {fullscreenOpen && (
        <FullscreenVideoModal
          src={src}
          poster={poster}
          startTime={videoRef.current?.currentTime ?? 0}
          onClose={handleFullscreenClose}
        />
      )}
    </>
  );
}
