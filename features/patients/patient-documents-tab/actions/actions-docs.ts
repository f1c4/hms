"use server";

import * as z from "zod";
import { createClient } from "@/utils/supabase/server";
import {
  CreateIdDocumentInput,
  CreateIdDocumentSchema,
  UpdateIdDocumentInput,
  UpdateIdDocumentSchema,
} from "../../patient-documents-tab/schemas/id-doc-schemas";
import { PatientIdDocumentModel } from "@/types/data-models";
import { Database } from "@/types/database-custom";

type ZodTreeError = {
  errors: string[];
  properties?: {
    [key: string]: ZodTreeError;
  };
};

export type ActionError = {
  type: "validation" | "conflict" | "notFound";
  messageKey: string;
  details?: ZodTreeError;
};

type PatientIdDocumentsTable =
  Database["public"]["Tables"]["patient_id_documents"];
type PatientIdDocumentsInsert = PatientIdDocumentsTable["Insert"];
type PatientIdDocumentsUpdate = PatientIdDocumentsTable["Update"];

const selectWithDetails =
  `*, documentTypeTranslations:document_types(translations)`;

/**
 * Creates a signed URL to securely view/download a file from storage.
 */
export async function getSignedViewUrl(filePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("patient-id-documents")
    .createSignedUrl(filePath, 60); // URL is valid for 60 seconds

  if (error) {
    console.error("Get Signed View URL Error:", error);
    throw new Error("Could not create a secure view link.");
  }
  return data;
}

/**
 * Generates a unique, permanent path for a file in Supabase storage.
 * This path is used by the TUS client to upload the file directly to its final destination.
 */
export async function getUploadPath(patientId: number, fileName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  // The final, permanent path for the file. No more staging.
  const path =
    `patient-id-documents/${patientId}/${crypto.randomUUID()}-${fileName}`;

  return { path };
}

/**
 * Checks for duplicate document type or number for a given patient.
 * This is a lightweight action called before a file upload begins.
 */
export async function validateDuplicateDocument(
  patientId: number,
  documentType: number,
  documentNumber: string,
  documentIdToExclude: number | null, // Pass the current doc ID when updating
): Promise<{ error?: ActionError }> {
  const supabase = await createClient();

  let query = supabase.from("patient_id_documents").select("id", {
    count: "exact",
    head: true,
  }).eq("patient_id", patientId);

  // Build an OR condition for duplicate type or number
  const orConditions = [
    `document_type.eq.${documentType}`,
    `document_number.eq.${documentNumber}`,
  ].join(",");

  query = query.or(orConditions);

  // If we are updating, exclude the current document from the check
  if (documentIdToExclude) {
    query = query.not("id", "eq", documentIdToExclude);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Duplicate validation error:", error);
    throw new Error("Server error during duplicate validation.");
  }

  if (count !== null && count > 0) {
    // A duplicate was found
    return {
      error: {
        type: "conflict",
        messageKey: "Patient.GeneralIdDocumentValidation.duplicateDocumentType",
      },
    };
  }

  // No duplicates found
  return {};
}

/**
 * Creates a new patient ID document.
 */
export async function createPatientIdDocument(
  input: CreateIdDocumentInput,
): Promise<{ data?: PatientIdDocumentModel; error?: ActionError }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const validation = CreateIdDocumentSchema.safeParse(input);
  if (!validation.success) {
    return {
      error: {
        type: "validation",
        messageKey: "Errors.validationError",
        details: z.treeifyError(validation.error),
      },
    };
  }

  const { data: validatedData } = validation;

  const dataToInsert: PatientIdDocumentsInsert = {
    patient_id: validatedData.patientId,
    document_type: validatedData.documentType,
    document_number: validatedData.documentNumber,
    issue_date: validatedData.issueDate.toISOString(),
    expiry_date: validatedData.expiryDate.toISOString(),
    file_path: validatedData.filePath,
    file_name: validatedData.fileName,
    file_size: validatedData.fileSize,
    file_type: validatedData.fileType,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("patient_id_documents")
    .insert(dataToInsert)
    .select(selectWithDetails)
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        error: {
          type: "conflict",
          messageKey:
            "Patient.GeneralIdDocumentValidation.duplicateDocumentType",
        },
      };
    }
    console.error("Create Document Error:", error);
    throw new Error("A server error occurred while creating the document.");
  }

  const { documentTypeTranslations, ...restOfData } = data;
  const result: PatientIdDocumentModel = {
    ...restOfData,
    documentTypeTranslations:
      (documentTypeTranslations.translations as Record<string, string>) || null,
  };

  return { data: result };
}

/**
 * Updates an existing patient ID document with optimistic locking.
 */
export async function updatePatientIdDocument(
  input: UpdateIdDocumentInput,
): Promise<{ data?: PatientIdDocumentModel; error?: ActionError }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const validation = UpdateIdDocumentSchema.safeParse(input);
  if (!validation.success) {
    return {
      error: {
        type: "validation",
        messageKey: "Errors.validationError",
        details: z.treeifyError(validation.error),
      },
    };
  }

  const { id, version, wantsToRemoveFile } = validation.data;
  // 1. Fetch the current document to get the old file path.
  const { data: currentDoc, error: fetchError } = await supabase
    .from("patient_id_documents")
    .select("file_path")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Update Document - Fetch Error:", fetchError);
    return {
      error: {
        type: "notFound",
        messageKey: "Patient.IdDocuments.Errors.notFound",
      },
    };
  }
  const oldFilePath = currentDoc.file_path;

  // 2. Prepare the base data for the update.
  // Start with file paths from the new upload (if any).
  const dataToUpdate: PatientIdDocumentsUpdate = {
    document_type: validation.data.documentType,
    document_number: validation.data.documentNumber,
    issue_date: validation.data.issueDate.toISOString(),
    expiry_date: validation.data.expiryDate.toISOString(),
    file_path: validation.data.filePath,
    file_name: validation.data.fileName,
    file_size: validation.data.fileSize,
    file_type: validation.data.fileType,
    updated_by: user.id,
    version: version + 1,
  };

  // 3. Decide if we need to delete an old file.
  const isReplacingFile = !!dataToUpdate.file_path;
  const isRemovingFile = wantsToRemoveFile && !isReplacingFile;

  if ((isReplacingFile || isRemovingFile) && oldFilePath) {
    // Delete the old file from storage.
    const { error: deleteError } = await supabase.storage
      .from("patient-id-documents")
      .remove([oldFilePath]);

    if (deleteError) {
      // Log the error but don't block the DB update, as the main intent might succeed.
      console.error("Failed to delete old file from storage:", deleteError);
    }
  }

  // 4. If removing, nullify the DB columns.
  if (isRemovingFile) {
    dataToUpdate.file_path = null;
    dataToUpdate.file_name = null;
    dataToUpdate.file_size = null;
    dataToUpdate.file_type = null;
  }

  const { data, error, count } = await supabase
    .from("patient_id_documents")
    .update(dataToUpdate)
    .eq("id", id)
    .eq("version", version)
    .select(selectWithDetails)
    .single();

  if (count === 0 && !error) {
    return {
      error: { type: "conflict", messageKey: "Patient.Errors.versionMismatch" },
    };
  }

  if (error) {
    console.error("Update Document Error:", error);
    throw new Error("A server error occurred while updating the document.");
  }

  const { documentTypeTranslations, ...restOfUpdatedData } = data;
  const result: PatientIdDocumentModel = {
    ...restOfUpdatedData,
    documentTypeTranslations:
      (documentTypeTranslations.translations as Record<string, string>) || null,
  };

  return { data: result };
}

/**
 * Deletes a patient document record and its associated file from storage.
 */
export async function deletePatientDocument(
  documentId: number,
): Promise<{ data?: { documentId: number }; error?: ActionError }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const { data: document, error: fetchError } = await supabase
    .from("patient_id_documents")
    .select("file_path, patient_id")
    .eq("id", documentId)
    .single();

  if (fetchError || !document) {
    return {
      error: {
        type: "notFound",
        messageKey: "Patient.IdDocuments.Errors.notFound",
      },
    };
  }

  if (document.file_path) {
    const { error: storageError } = await supabase.storage.from(
      "patient-id-documents",
    ).remove([document.file_path]);
    if (storageError) {
      console.error(
        `Failed to delete file from storage: ${storageError.message}`,
      );
    }
  }

  const { error: dbError } = await supabase.from("patient_id_documents")
    .delete().eq("id", documentId);

  if (dbError) {
    console.error(`Failed to delete document record: ${dbError.message}`);
    throw new Error(
      "A server error occurred while deleting the document record.",
    );
  }

  return { data: { documentId } };
}
