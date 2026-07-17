// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   XIcon,
//   PlayIcon,
//   SpeakerHighIcon,
//   SpeakerSlashIcon,
// } from "@phosphor-icons/react";

// type Props = {
//   src: string;
//   poster: string;
//   startTime: number;
//   onClose: (currentTime: number) => void;
// };

// export function FullscreenVideoModal({
//   src,
//   poster,
//   startTime,
//   onClose,
// }: Props) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   // Unmuted by default — tapping into fullscreen is an explicit "I want to
//   // actually watch/listen to this" action, unlike the silent feed autoplay.
//   const [muted, setMuted] = useState(false);
//   const [playing, setPlaying] = useState(true);

//   // Pick up exactly where the feed thumbnail left off, and lock page
//   // scroll while this is open so it feels like a real takeover.
//   useEffect(() => {
//     const el = videoRef.current;
//     if (el) {
//       el.currentTime = startTime;
//       el.play().catch(() => {
//         // Autoplay-with-sound can be blocked by the browser — fails silently,
//         // the visible pause icon still lets the person tap to start it.
//         setPlaying(false);
//       });
//     }

//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [startTime]);

//   function close() {
//     onClose(videoRef.current?.currentTime ?? 0);
//   }

//   // Escape closes on desktop, for anyone previewing this in a browser tab.
//   useEffect(() => {
//     function handleKeyDown(e: KeyboardEvent) {
//       if (e.key === "Escape") close();
//     }
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   function togglePlay() {
//     const el = videoRef.current;
//     if (!el) return;
//     if (el.paused) {
//       el.play();
//       setPlaying(true);
//     } else {
//       el.pause();
//       setPlaying(false);
//     }
//   }

//   return (
//     <div className="fixed inset-0 z-70 flex items-center justify-center bg-black">
//       <video
//         ref={videoRef}
//         src={src}
//         poster={poster}
//         className="h-full w-full object-contain"
//         muted={muted}
//         loop
//         playsInline
//         onClick={togglePlay}
//       />

//       {!playing && (
//         <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
//           <PlayIcon weight="fill" className="size-16 text-white/90" />
//         </div>
//       )}

//       <button
//         type="button"
//         onClick={close}
//         aria-label="Close video"
//         className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex size-9 items-center justify-center rounded-full bg-black/40 text-white active:scale-90 transition-transform"
//       >
//         <XIcon size={20} />
//       </button>

//       <button
//         type="button"
//         onClick={(e) => {
//           e.stopPropagation();
//           setMuted((m) => !m);
//         }}
//         aria-label={muted ? "Unmute video" : "Mute video"}
//         className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 flex size-9 items-center justify-center rounded-full bg-black/40 text-white active:scale-90 transition-transform"
//       >
//         {muted ? <SpeakerSlashIcon size={18} /> : <SpeakerHighIcon size={18} />}
//       </button>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import {
  XIcon,
  PlayIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
} from "@phosphor-icons/react";

type Props = {
  src: string;
  poster: string;
  startTime: number;
  onClose: (currentTime: number) => void;
};

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function FullscreenVideoModal({
  src,
  poster,
  startTime,
  onClose,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [posterVisible, setPosterVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = videoRef.current;
    if (el) {
      el.currentTime = startTime;
      el.play().catch(() => setPlaying(false));
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [startTime]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function close() {
    onClose(videoRef.current?.currentTime ?? 0);
  }

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = value;
    setCurrentTime(value);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-contain"
        muted={muted}
        loop
        playsInline
        onClick={togglePlay}
        onPlaying={() => setPosterVisible(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {/* Manual poster overlay — stays up until the video actually reports
          it's playing the right frame, instead of the browser's own
          poster-swap, which happens abruptly and causes the flash. */}
      {posterVisible && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />
      )}

      {!playing && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <PlayIcon weight="fill" className="size-16 text-white/90" />
        </div>
      )}

      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMuted((m) => !m);
          }}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="flex size-9 items-center justify-center rounded-full bg-black/40 text-white transition-transform active:scale-90"
        >
          {muted ? (
            <SpeakerSlashIcon size={18} />
          ) : (
            <SpeakerHighIcon size={18} />
          )}
        </button>

        <button
          type="button"
          onClick={close}
          aria-label="Close video"
          className="flex size-9 items-center justify-center rounded-full bg-black/40 text-white transition-transform active:scale-90"
        >
          <XIcon size={20} />
        </button>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/70 to-transparent px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-10"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          aria-label="Seek video"
          className="h-1 w-full cursor-pointer accent-white"
        />
        <div className="flex items-center justify-between text-xs text-white/80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
