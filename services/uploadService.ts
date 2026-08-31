import { apiFetch } from "@/utils/apiClient";
import { API_ROUTES } from "@/utils/apiRoutes";
import { withAutoOptimization } from "@/utils/cloudinaryOptimize";

export type UploadContext = "avatar" | "post-image" | "post-video";

type UploadSignatureResponse = {
  success: boolean;
  error?: string;
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  overwrite: boolean;
  resourceType: "image" | "video";
};

export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

// Two real network calls, to two different servers:
// 1. Our own backend — asks for a signed permission slip for this
//    specific upload (which folder, which public_id, etc.), never sees
//    the actual file.
// 2. Cloudinary directly — the file itself goes straight there, using
//    that signed slip. Our server is never in the path of the file
//    bytes at all, which is what keeps this viable for large video
//    uploads later, not just small avatar images.
export async function uploadMedia(
  file: File,
  context: UploadContext,
): Promise<UploadResult> {
  const sigResult = (await apiFetch(API_ROUTES.UPLOAD.SIGNATURE, {
    method: "POST",
    body: JSON.stringify({ context }),
  })) as UploadSignatureResponse;

  if (!sigResult?.success) {
    return {
      success: false,
      error: sigResult?.error || "Couldn't prepare upload.",
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sigResult.apiKey);
  formData.append("timestamp", String(sigResult.timestamp));
  formData.append("signature", sigResult.signature);
  formData.append("folder", sigResult.folder);
  formData.append("public_id", sigResult.publicId);
  if (sigResult.overwrite) {
    formData.append("overwrite", "true");
  }

  try {
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${sigResult.cloudName}/${sigResult.resourceType}/upload`,
      { method: "POST", body: formData },
    );
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || !uploadData.secure_url) {
      return {
        success: false,
        error: uploadData?.error?.message || "Upload failed. Try again.",
      };
    }

    return {
      success: true,
      url: withAutoOptimization(uploadData.secure_url as string),
    };
  } catch {
    return { success: false, error: "Network error during upload." };
  }
}
