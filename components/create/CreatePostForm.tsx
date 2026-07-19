"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  XIcon,
  ImageSquareIcon,
  VideoCameraIcon,
  ArrowsLeftRightIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { usePosts } from "@/context/PostsProvider";
import { CURRENT_USER } from "@/constants/currentUser";
import { ProductTagEditor } from "@/components/shared/ProductTagEditor";
import { PATHS } from "@/utils/paths";
import type { Post, PostMedia, ProductTag } from "@/types/post";

type PostType = "photo" | "video" | "before_after";

const MAX_CAROUSEL_IMAGES = 10;

export function CreatePostForm() {
  const router = useRouter();
  const { addPost } = usePosts();

  const [postType, setPostType] = useState<PostType>("photo");
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [products, setProducts] = useState<ProductTag[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  function handleImagesSelected(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...urls].slice(0, MAX_CAROUSEL_IMAGES));
    e.target.value = ""; // lets the same file be re-picked if removed and re-added
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleVideoSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setVideoUrl(URL.createObjectURL(file));
  }

  function handleBeforeSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setBeforeUrl(URL.createObjectURL(file));
  }

  function handleAfterSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAfterUrl(URL.createObjectURL(file));
  }

  function buildMedia(): PostMedia | null {
    if (postType === "photo") {
      if (images.length === 0) return null;
      if (images.length === 1) {
        return {
          id: crypto.randomUUID(),
          type: "image",
          src: images[0],
          alt: caption || "Post image",
        };
      }
      return {
        id: crypto.randomUUID(),
        type: "carousel",
        items: images.map((src) => ({ src, alt: caption || "Post image" })),
      };
    }

    if (postType === "video") {
      if (!videoUrl) return null;
      // No poster yet — generating a real thumbnail needs a canvas frame
      // capture from the video, which is a reasonable next step once this
      // is wired to a real backend that can do it server-side instead.
      return {
        id: crypto.randomUUID(),
        type: "video",
        src: videoUrl,
        poster: "",
      };
    }

    if (postType === "before_after") {
      if (!beforeUrl || !afterUrl) return null;
      return {
        id: crypto.randomUUID(),
        type: "before_after",
        before: { src: beforeUrl, alt: "Before" },
        after: { src: afterUrl, alt: "After" },
      };
    }

    return null;
  }

  const media = buildMedia();
  const canSubmit = media !== null;

  function handleSubmit() {
    if (!media) return;

    const newPost: Post = {
      id: crypto.randomUUID(),
      author: CURRENT_USER,
      media,
      products: products.length > 0 ? products : undefined,
      caption,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };

    addPost(newPost);
    router.push(PATHS.HOME);
  }

  return (
    <div className="fixed left-1/2 top-0 bottom-0 z-80 w-full max-w-lg -translate-x-1/2 flex flex-col bg-background">
      <header className="flex items-center justify-between border-b border-foreground/10 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <button type="button" onClick={() => router.back()} aria-label="Cancel">
          <XIcon size={22} className="text-foreground" />
        </button>
        <span className="text-sm font-medium">New post</span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="text-sm font-medium text-foreground disabled:opacity-30"
        >
          Share
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="mb-5 flex gap-2">
          <button
            type="button"
            onClick={() => setPostType("photo")}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs transition-colors ${
              postType === "photo"
                ? "border-foreground bg-foreground/5"
                : "border-foreground/15 text-foreground/60"
            }`}
          >
            <ImageSquareIcon size={20} />
            Photo
          </button>
          <button
            type="button"
            onClick={() => setPostType("video")}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs transition-colors ${
              postType === "video"
                ? "border-foreground bg-foreground/5"
                : "border-foreground/15 text-foreground/60"
            }`}
          >
            <VideoCameraIcon size={20} />
            Video
          </button>
          <button
            type="button"
            onClick={() => setPostType("before_after")}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs transition-colors ${
              postType === "before_after"
                ? "border-foreground bg-foreground/5"
                : "border-foreground/15 text-foreground/60"
            }`}
          >
            <ArrowsLeftRightIcon size={20} />
            Before/After
          </button>
        </div>

        {postType === "photo" && (
          <div className="mb-5">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <div
                  key={src}
                  className="relative size-24 shrink-0 overflow-hidden rounded-lg"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              ))}

              {images.length < MAX_CAROUSEL_IMAGES && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-foreground/20 text-foreground/40"
                >
                  <PlusIcon size={18} />
                  <span className="text-[10px]">Add</span>
                </button>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesSelected}
              className="hidden"
            />
            <p className="mt-1.5 text-xs text-foreground/40">
              {images.length > 1
                ? "Multiple photos post as a carousel."
                : "Add more photos for a carousel."}
            </p>
          </div>
        )}

        {postType === "video" && (
          <div className="mb-5">
            {videoUrl ? (
              <div className="relative aspect-9/16 w-40 overflow-hidden rounded-lg bg-black">
                <video
                  src={videoUrl}
                  className="h-full w-full object-cover"
                  controls
                  muted
                />
                <button
                  type="button"
                  onClick={() => setVideoUrl(null)}
                  aria-label="Remove video"
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <XIcon size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex aspect-9/16 w-40 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-foreground/20 text-foreground/40"
              >
                <VideoCameraIcon size={22} />
                <span className="text-xs">Add video</span>
              </button>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelected}
              className="hidden"
            />
          </div>
        )}

        {postType === "before_after" && (
          <div className="mb-5 flex gap-3">
            <div className="flex-1">
              <p className="mb-1.5 text-xs text-foreground/50">Before</p>
              {beforeUrl ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                  <Image
                    src={beforeUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setBeforeUrl(null)}
                    aria-label="Remove before photo"
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => beforeInputRef.current?.click()}
                  className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-foreground/20 text-foreground/40"
                >
                  <PlusIcon size={18} />
                  <span className="text-xs">Add photo</span>
                </button>
              )}
              <input
                ref={beforeInputRef}
                type="file"
                accept="image/*"
                onChange={handleBeforeSelected}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <p className="mb-1.5 text-xs text-foreground/50">After</p>
              {afterUrl ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                  <Image
                    src={afterUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setAfterUrl(null)}
                    aria-label="Remove after photo"
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => afterInputRef.current?.click()}
                  className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-foreground/20 text-foreground/40"
                >
                  <PlusIcon size={18} />
                  <span className="text-xs">Add photo</span>
                </button>
              )}
              <input
                ref={afterInputRef}
                type="file"
                accept="image/*"
                onChange={handleAfterSelected}
                className="hidden"
              />
            </div>
          </div>
        )}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption…"
          rows={3}
          className="mb-5 w-full resize-none rounded-lg border border-foreground/15 bg-transparent p-3 text-sm outline-none"
        />

        <ProductTagEditor
          label="Tag products"
          placeholder="e.g. Foundation: Fenty Pro Filt'r 240"
          products={products}
          onChange={setProducts}
        />
      </div>
    </div>
  );
}
