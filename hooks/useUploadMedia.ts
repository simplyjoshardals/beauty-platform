"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadMedia, type UploadContext } from "@/services/uploadService";

export function useUploadMedia() {
  return useMutation({
    mutationFn: ({ file, context }: { file: File; context: UploadContext }) =>
      uploadMedia(file, context),
  });
}
