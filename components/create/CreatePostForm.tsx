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

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ProductTagEditor } from "@/components/shared/ProductTagEditor";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PATHS } from "@/utils/paths";
import type { PostMedia, ProductTag } from "@/types/post";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useUploadMedia } from "@/hooks/useUploadMedia";
import type { CreatePostInput } from "@/services/postService";

type PostType = "photo" | "video" | "before_after";

const MAX_CAROUSEL_IMAGES = 10;

export function CreatePostForm() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { mutateAsync: uploadMedia } = useUploadMedia();
  const { mutateAsync: createPost } = useCreatePost();

  // Single source of truth for "is anything in flight right now", owned
  // directly instead of derived from the upload/create mutations'
  // isPending flags. Those two flags belong to separate hooks, so there
  // was a real gap between the upload phase finishing and the create
  // phase starting (both false for a beat) — and another gap after
  // createPost resolves but before router.push's navigation actually
  // lands — where the form would flash back to fully interactive
  // mid-submit. isPosting is set true once, at the top of handleSubmit,
  // and only ever reset to false in the catch branch: on success it
  // deliberately stays true all the way through the redirect, since
  // there's nothing to reset it FOR — the component is about to unmount.
  const [isPosting, setIsPosting] = useState(false);
  const isBusy = isPosting;

  const [postType, setPostType] = useState<PostType>("photo");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [products, setProducts] = useState<ProductTag[]>([]);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  function handleImagesSelected(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...urls].slice(0, MAX_CAROUSEL_IMAGES));
    setImageFiles((prev) => [...prev, ...files].slice(0, MAX_CAROUSEL_IMAGES));
    e.target.value = ""; // lets the same file be re-picked if removed and re-added
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleVideoSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setVideoUrl(URL.createObjectURL(file));
      setVideoFile(file);
    }
  }

  function handleBeforeSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setBeforeUrl(URL.createObjectURL(file));
      setBeforeFile(file);
    }
  }

  function handleAfterSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAfterUrl(URL.createObjectURL(file));
      setAfterFile(file);
    }
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
      // The real poster is derived server-side from videoSrc once the
      // upload lands (see app/api/posts/route.ts) — this local preview
      // object is only ever used to gate canSubmit below, so an empty
      // poster here is fine.
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

  // Only warn about discarding if there's actually something to lose —
  // canceling an untouched, empty form shouldn't nag anyone.
  function hasDraftContent() {
    return (
      caption.trim().length > 0 ||
      images.length > 0 ||
      videoUrl !== null ||
      beforeUrl !== null ||
      afterUrl !== null ||
      products.length > 0
    );
  }

  function handleCancelPress() {
    if (isBusy) return;
    if (hasDraftContent()) {
      setConfirmingDiscard(true);
    } else {
      router.back();
    }
  }

  async function handleSubmit() {
    if (!media || !user || isBusy) return;
    setSubmitError(null);
    setIsPosting(true);

    try {
      const productInputs = products.map((p) => ({ label: p.label }));
      let input: CreatePostInput;

      if (postType === "photo" && images.length === 1) {
        const result = await uploadMedia({
          file: imageFiles[0],
          context: "post-image",
        });
        if (!result.success) throw new Error(result.error);
        input = {
          mediaType: "IMAGE",
          caption,
          products: productInputs,
          imageSrc: result.url,
          imageAlt: caption || "Post image",
        };
      } else if (postType === "photo") {
        const results = await Promise.all(
          imageFiles.map((file) =>
            uploadMedia({ file, context: "post-image" }),
          ),
        );
        const failed = results.find((r) => !r.success);
        if (failed && !failed.success) throw new Error(failed.error);
        const urls = (results as { success: true; url: string }[]).map(
          (r) => r.url,
        );
        input = {
          mediaType: "CAROUSEL",
          caption,
          products: productInputs,
          carouselItems: urls.map((src) => ({
            src,
            alt: caption || "Post image",
          })),
        };
      } else if (postType === "video") {
        if (!videoFile) throw new Error("Add a video first.");
        const result = await uploadMedia({
          file: videoFile,
          context: "post-video",
        });
        if (!result.success) throw new Error(result.error);
        input = {
          mediaType: "VIDEO",
          caption,
          products: productInputs,
          videoSrc: result.url,
        };
      } else {
        if (!beforeFile || !afterFile) {
          throw new Error("Add both a before and after photo.");
        }
        const [beforeResult, afterResult] = await Promise.all([
          uploadMedia({ file: beforeFile, context: "post-image" }),
          uploadMedia({ file: afterFile, context: "post-image" }),
        ]);
        if (!beforeResult.success) throw new Error(beforeResult.error);
        if (!afterResult.success) throw new Error(afterResult.error);
        input = {
          mediaType: "BEFORE_AFTER",
          caption,
          products: productInputs,
          beforeSrc: beforeResult.url,
          beforeAlt: "Before",
          afterSrc: afterResult.url,
          afterAlt: "After",
        };
      }

      const result = await createPost(input);
      if (!result?.success) {
        throw new Error(
          !result?.success ? result?.error : "Couldn't share your post.",
        );
      }

      router.push(PATHS.HOME);
      // No setIsPosting(false) here on purpose — see the comment on
      // isPosting above. Resetting it here is exactly what let the form
      // flash back to interactive before the redirect actually landed.
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Couldn't share your post.",
      );
      setIsPosting(false);
    }
  }

  return (
    <div className="fixed left-1/2 top-0 bottom-0 z-80 w-full max-w-lg -translate-x-1/2 flex flex-col bg-background">
      <header className="flex items-center justify-between border-b border-foreground/10 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={handleCancelPress}
          disabled={isBusy}
          aria-label="Cancel"
          className="disabled:opacity-30"
        >
          <XIcon size={22} className="text-foreground" />
        </button>
        <span className="text-sm font-medium">New post</span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isBusy}
          className="text-sm font-medium text-foreground disabled:opacity-30"
        >
          {isBusy ? "Sharing…" : "Share"}
        </button>
      </header>

      {submitError && (
        <p className="px-4 pt-2 text-xs text-red-500">{submitError}</p>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="mb-5 flex gap-2">
          <button
            type="button"
            onClick={() => setPostType("photo")}
            disabled={isBusy}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs transition-colors disabled:opacity-30 ${
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
            disabled={isBusy}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs transition-colors disabled:opacity-30 ${
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
            disabled={isBusy}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs transition-colors disabled:opacity-30 ${
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
                    disabled={isBusy}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-30"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              ))}

              {images.length < MAX_CAROUSEL_IMAGES && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isBusy}
                  className="flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-foreground/20 text-foreground/40 disabled:opacity-30"
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
              disabled={isBusy}
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
                  disabled={isBusy}
                  aria-label="Remove video"
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-30"
                >
                  <XIcon size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={isBusy}
                className="flex aspect-9/16 w-40 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-foreground/20 text-foreground/40 disabled:opacity-30"
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
              disabled={isBusy}
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
                    disabled={isBusy}
                    aria-label="Remove before photo"
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-30"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => beforeInputRef.current?.click()}
                  disabled={isBusy}
                  className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-foreground/20 text-foreground/40 disabled:opacity-30"
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
                disabled={isBusy}
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
                    disabled={isBusy}
                    aria-label="Remove after photo"
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-30"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => afterInputRef.current?.click()}
                  disabled={isBusy}
                  className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-foreground/20 text-foreground/40 disabled:opacity-30"
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
                disabled={isBusy}
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
          disabled={isBusy}
          className="mb-5 w-full resize-none rounded-lg border border-foreground/15 bg-transparent p-3 text-sm outline-none disabled:opacity-50"
        />

        <ProductTagEditor
          label="Tag products"
          placeholder="e.g. Foundation: Fenty Pro Filt'r 240"
          products={products}
          onChange={setProducts}
          disabled={isBusy}
        />
      </div>

      <ConfirmDialog
        open={confirmingDiscard}
        title="Discard this post?"
        description="You'll lose what you've added so far."
        confirmLabel="Discard"
        destructive
        onConfirm={() => router.back()}
        onCancel={() => setConfirmingDiscard(false)}
      />
    </div>
  );
}