"use client";

import { useState } from "react";
import * as tus from "tus-js-client";
import { getInsuranceUploadPath } from "../../actions/actions-insurance";
import { createClient } from "@/utils/supabase/client";

const BUCKET_NAME = "patient-insurances";

export function useTusUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const startUpload = async (file: File, patientId: number) => {
    setIsUploading(true);
    setUploadProgress(0);

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Authentication required for upload.");

    const { path } = await getInsuranceUploadPath(patientId, file.name);

    return new Promise<{
      file_path: string;
      file_name: string;
      file_size: number;
      file_type: string;
    }>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          "x-upsert": "true",
        },
        uploadDataDuringCreation: true,
        metadata: {
          bucketName: BUCKET_NAME,
          objectName: path,
          contentType: file.type,
          cacheControl: "3600",
        },
        chunkSize: 6 * 1024 * 1024,
        onError: (error) => {
          console.error("Failed because: ", error);
          setIsUploading(false);
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setUploadProgress(parseFloat(percentage));
        },
        onSuccess: () => {
          setIsUploading(false);
          resolve({
            file_path: path,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
          });
        },
      });

      upload.start();
    });
  };

  return { startUpload, isUploading, uploadProgress };
}