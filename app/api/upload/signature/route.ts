import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import cloudinary from "@/lib/cloudinary";

// One shared upload pipeline for every kind of media this app will ever
// need — avatars today, post images/videos once post creation gets
// wired to real uploads too. Each context just maps to a different
// folder + resource type; the actual signing/upload flow is identical.
export type UploadContext = "avatar" | "post-image" | "post-video";

const CONTEXT_CONFIG: Record<
  UploadContext,
  { folder: string; resourceType: "image" | "video"; overwrite: boolean }
> = {
  // Stable public_id per user (the userId itself) + overwrite:true — a
  // new avatar upload replaces the old file at the exact same
  // Cloudinary path, so there's never a pile-up of orphaned old avatars.
  avatar: { folder: "vanity/avatars", resourceType: "image", overwrite: true },
  // Post media gets a fresh random id per upload — a post can have many
  // images (carousels), and none of them should ever overwrite another.
  "post-image": {
    folder: "vanity/posts/images",
    resourceType: "image",
    overwrite: false,
  },
  "post-video": {
    folder: "vanity/posts/videos",
    resourceType: "video",
    overwrite: false,
  },
};

// x-user-id is set by proxy.ts, which already validated the session
// before this route runs — same pattern as every other /api/user(-ish)
// route. This route lives under /api/upload, so it needs adding to
// proxy.ts's own protected-routes list separately (see proxy.ts).
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { context } = await req.json();

    if (!context || !(context in CONTEXT_CONFIG)) {
      return NextResponse.json(
        { success: false, error: "Invalid upload context" },
        { status: 400 }
      );
    }

    const config = CONTEXT_CONFIG[context as UploadContext];
    const publicId = context === "avatar" ? userId : nanoid(16);
    const timestamp = Math.round(Date.now() / 1000);

    // Every one of these params gets sent in the actual upload request
    // to Cloudinary later — the signature only validates if what's
    // signed here EXACTLY matches what's later submitted. api_key and
    // the file itself are deliberately not part of what gets signed;
    // that's how Cloudinary's signed-upload scheme works.
    const paramsToSign: Record<string, string | number | boolean> = {
      timestamp,
      folder: config.folder,
      public_id: publicId,
    };
    if (config.overwrite) {
      paramsToSign.overwrite = true;
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: config.folder,
      publicId,
      overwrite: config.overwrite,
      resourceType: config.resourceType,
    });
  } catch (err) {
    console.error("upload signature error", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}