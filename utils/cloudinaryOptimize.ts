const UPLOAD_MARKER = "/upload/";

// Cloudinary can pick the best format (e.g. AVIF/WebP over JPEG/PNG) and
// the best quality level for each requesting browser automatically —
// f_auto and q_auto — instead of every client always getting whatever
// format/quality the file happened to be uploaded as. Applying it once
// here, right where every upload's secure_url is first received, means
// every image and video the app ever renders is optimized for free:
// nothing downstream (posts, avatars, carousels, before/after slides)
// has to remember to ask for it.
//
// Input:  https://res.cloudinary.com/<cloud>/image/upload/v169.../vanity/posts/images/abc123.jpg
// Output: https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/v169.../vanity/posts/images/abc123.jpg
//
// Works the same way for /video/upload/ URLs — f_auto,q_auto is valid
// for Cloudinary video delivery too, not just images.
export function withAutoOptimization(url: string): string {
  if (!url) return url;

  const markerIndex = url.indexOf(UPLOAD_MARKER);
  if (markerIndex === -1) return url;

  const prefix = url.slice(0, markerIndex + UPLOAD_MARKER.length);
  const rest = url.slice(markerIndex + UPLOAD_MARKER.length);

  // Already has a transformation segment (e.g. a video thumbnail's
  // so_0/) — don't stack another one in front of it, just fold f_auto
  // and q_auto into the existing segment instead of duplicating markers.
  const alreadyTransformed = /^[a-z]+_[^/]+\//i.test(rest);
  if (alreadyTransformed) {
    const [firstSegment, ...restSegments] = rest.split("/");
    return `${prefix}f_auto,q_auto,${firstSegment}/${restSegments.join("/")}`;
  }

  return `${prefix}f_auto,q_auto/${rest}`;
}
