const VIDEO_UPLOAD_MARKER = "/video/upload/";

// Cloudinary can render a frame of an already-uploaded video as a real
// image on the fly — same asset, different delivery URL — so a poster
// never needs its own upload step or a Cloudinary API call. Swapping
// the extension to .jpg and adding an so_ (seek-offset) transformation
// is all it takes; Cloudinary generates and caches that derived image
// the first time the URL is requested.
//
// Input:  https://res.cloudinary.com/<cloud>/video/upload/v169.../vanity/posts/videos/abc123.mp4
// Output: https://res.cloudinary.com/<cloud>/video/upload/so_0/v169.../vanity/posts/videos/abc123.jpg
//
// so_0 grabs the very first frame. If a particular source's first frame
// tends to render black/blank, bump this to so_1 or so_2 — a tiny,
// one-line change, not a re-architecture.
export function getCloudinaryVideoThumbnail(videoUrl: string): string {
  if (!videoUrl) return "";

  const markerIndex = videoUrl.indexOf(VIDEO_UPLOAD_MARKER);
  if (markerIndex === -1) return "";

  const prefix = videoUrl.slice(0, markerIndex + VIDEO_UPLOAD_MARKER.length);
  const rest = videoUrl.slice(markerIndex + VIDEO_UPLOAD_MARKER.length);
  const restWithoutExtension = rest.replace(/\.[^./]+$/, "");

  if (!restWithoutExtension) return "";

  return `${prefix}so_0/${restWithoutExtension}.jpg`;
}
