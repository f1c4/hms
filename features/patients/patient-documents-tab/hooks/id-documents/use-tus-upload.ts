"use client";

import { Upload } from "tus-js-client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUploadPath } from "../../actions/actions-docs";

// Define the shape of the file details we'll get on success
interface UploadDetails {
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export function useTusUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const startUpload = (
    file: File,
    patientId: number
  ): Promise<UploadDetails> => {
    return new Promise(async (resolve, reject) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return reject(new Error("User not authenticated."));
      }

      // Get the permanent path from our new server action
      const { path } = await getUploadPath(patientId, file.name);

      const upload = new Upload(file, {
        // The endpoint is the standard Supabase resumable upload URL
        endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          "x-upsert": "true", // Supabase-specific header
        },
        metadata: {
          bucketName: "patient-id-documents",
          objectName: path,
          contentType: file.type,
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setUploadProgress(Number(percentage));
        },
        onSuccess: () => {
          setIsUploading(false);
          resolve({
            filePath: path,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          });
        },
        onError: (error) => {
          setIsUploading(false);
          console.error("Failed to upload file:", error);
          reject(error);
        },
      });

      setIsUploading(true);
      setUploadProgress(0);
      upload.start();
    });
  };

  return { startUpload, isUploading, uploadProgress };
}