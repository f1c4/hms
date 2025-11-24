"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";

/**
 * A custom hook to handle client-side image compression before uploading.
 * Provides feedback on the compression status and progress.
 */
export function useImageCompressor() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  /**
   * Compresses an image file if it's larger than the specified threshold.
   * @param file The image file to compress.
   * @returns A promise that resolves with the compressed file (or original if not compressed).
   */
  const compressFile = async (file: File): Promise<File> => {
    // Only compress common image types
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return file;
    }

    // Don't compress files that are already small (e.g., under 5MB)
    if (file.size <= 5 * 1024 * 1024) {
      return file;
    }

    console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    setIsCompressing(true);
    setCompressionProgress(0);

    const options = {
      maxSizeMB: 3, // Target size
      maxWidthOrHeight: 1920, // Max dimensions
      useWebWorker: true, // Use a web worker to avoid freezing the UI
      onProgress: (p: number) => {
        setCompressionProgress(p);
      },
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
      setIsCompressing(false);
      return compressedFile;
    } catch (error) {
      console.error("Image compression failed:", error);
      setIsCompressing(false);
      // Return the original file if compression fails
      return file;
    }
  };

  return {
    compressFile,
    isCompressing,
    compressionProgress,
  };
}