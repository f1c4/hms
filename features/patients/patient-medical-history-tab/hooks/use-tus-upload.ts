"use client";

import { useState } from "react";
import * as tus from "tus-js-client";
import { getMedicalDocumentUploadPath } from "../actions/docs-actions";
import { createClient } from "@/utils/supabase/client";

const BUCKET_NAME = "patient-medical-documents";

export interface UploadDetails {
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export function useTusUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const startUpload = async (
    file: File,
    patientId: number,
    eventId: number
  ): Promise<UploadDetails> => {
    setIsUploading(true);
    setUploadProgress(0);

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Authentication required for upload.");

    const { path } = await getMedicalDocumentUploadPath(
      patientId,
      eventId,
      file.name
    );

    return new Promise<UploadDetails>((resolve, reject) => {
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
          console.error("TUS Upload Error: ", error);
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
            filePath: path,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          });
        },
      });

      upload.start();
    });
  };

  return { startUpload, isUploading, uploadProgress };
}