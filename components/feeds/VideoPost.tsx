"use client";

import { useEffect, useRef, useState } from "react";
import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";

// iOS Safari doesn't support the standard Fullscreen API on <video> — it
// has its own native fullscreen player entry point instead.
type VideoWithSafariFullscreen = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};

export function VideoPost({ src, poster }: { src: string; poster: string }) {
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Autoplay only while actually visible in the feed — pauses once
  // scrolled off-screen, instead of every video in the feed playing at once.
  useEffect(() => {
    const videoEl = videoRef.current;
    const containerEl = containerRef.current;
    if (!videoEl || !containerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoEl.play().catch(() => {});
        } else if (document.fullscreenElement !== videoEl) {
          videoEl.pause();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(containerEl);
    return () => observer.disconnect();
  }, []);

  // Track fullscreen state from the browser itself rather than guessing —
  // this covers exiting via swipe-down, Escape, back gesture, etc. for free.
  useEffect(() => {
    function handleFullscreenChange() {
      const inFullscreen = document.fullscreenElement === videoRef.current;
      setIsFullscreen(inFullscreen);
      setMuted(!inFullscreen); // silent in-feed, audible once actually watching
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  function openFullscreen() {
    const el = videoRef.current as VideoWithSafariFullscreen | null;
    if (!el) return;

    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitEnterFullscreen) {
      el.webkitEnterFullscreen();
      setIsFullscreen(true);
      setMuted(false);
    }
  }

  return (
    <div ref={containerRef} className="relative aspect-9/16 w-full bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full object-cover"
        muted={muted}
        loop
        playsInline
        controls={isFullscreen}
        onClick={!isFullscreen ? openFullscreen : undefined}
      />

      {!isFullscreen && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMuted((m) => !m);
          }}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white transition-transform active:scale-90"
        >
          {muted ? (
            <SpeakerSlashIcon size={16} />
          ) : (
            <SpeakerHighIcon size={16} />
          )}
        </button>
      )}
    </div>
  );
}
