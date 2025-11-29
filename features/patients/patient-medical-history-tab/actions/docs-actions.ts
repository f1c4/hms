"use server";

import { createClient } from "@/utils/supabase/server";
import {
  CreateMedicalDocumentInput,
  CreateMedicalDocumentSchema,
  UpdateMedicalDocumentInput,
  UpdateMedicalDocumentSchema,
} from "../schemas/docs-srv-schemas";
import { unstable_noStore as noStore } from "next/cache";
import { Database } from "@/types/database-custom";
import { MedicalHistoryDocumentClientModel } from "@/types/client-models";
import z from "zod";
import { getTargetLocales } from "@/i18n/locale-config";
import { AiTranslationStatus } from "../types";

type ZodTreeError = {
  errors: string[];
  properties?: {
    [key: string]: ZodTreeError;
  };
};

const BUCKET_NAME = "patient-medical-documents";

// Using the same structured error type as your other actions
export type ActionError = {
  type: "validation" | "conflict" | "notFound";
  messageKey: string;
  details?: ZodTreeError;
};

type MedicalDocumentsTable =
  Database["public"]["Tables"]["patient_medical_documents"];
type MedicalDocumentsInsert = MedicalDocumentsTable["Insert"];

/**
 * Creates a signed URL to securely view/download a file from storage.
 */
export async function getSignedViewUrl(filePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("patient-medical-documents")
    .createSignedUrl(filePath, 60); // URL is valid for 60 seconds

  if (error) {
    console.error("Get Signed View URL Error:", error);
    throw new Error("Could not create a secure view link.");
  }
  return data;
}

/**
 * Fetches all available medical document types.
 */
export async function getMedicalDocumentTypes() {
  noStore();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("medical_document_types")
    .select("id, name_translations")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching document types:", error);
    return [];
  }

  return data;
}

/**
 * Generates a unique, permanent path for a medical document file in Supabase storage.
 */
export async function getMedicalDocumentUploadPath(
  patientId: number,
  eventId: number,
  fileName: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const path = `${patientId}/${eventId}/${crypto.randomUUID()}-${fileName}`;
  return { path };
}

/**
 * Creates a new patient medical document record and links it to an event and diagnoses.
 * Triggers background translation if notes are provided.
 */
export async function createPatientMedicalDocument(
  input: CreateMedicalDocumentInput,
): Promise<{ data?: MedicalHistoryDocumentClientModel; error?: ActionError }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const validation = CreateMedicalDocumentSchema.safeParse(input);
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
  const locale = validatedData.ai_source_locale;

  const hasTranslatableContent = !!validatedData.notes;

  const dataToInsert: MedicalDocumentsInsert = {
    event_id: validatedData.eventId,
    document_type_id: validatedData.documentType,
    document_date: validatedData.documentDate.toISOString(),
    notes: validatedData.notes ? { [locale]: validatedData.notes } : null,
    ai_source_locale: locale,
    ai_translation_status: hasTranslatableContent ? "in_progress" : "idle",
    ai_translation_error: null,
    file_path: validatedData.file.filePath,
    file_name: validatedData.file.fileName,
    file_size: validatedData.file.fileSize,
    file_type: validatedData.file.fileType,
    created_by: user.id,
  };

  const { data: newDocument, error } = await supabase
    .from("patient_medical_documents")
    .insert(dataToInsert)
    .select(`id`)
    .single();

  if (error) {
    console.error("Create Medical Document Error:", error);
    throw new Error(
      "A server error occurred while creating the medical document.",
    );
  }

  const newDocumentId = newDocument.id;

  if (validatedData.diagnoses && validatedData.diagnoses.length > 0) {
    const diagnosesToLink = validatedData.diagnoses.map((code) => ({
      document_id: newDocumentId,
      diagnosis_code: code,
    }));

    const { error: diagnosesError } = await supabase
      .from("patient_medical_document_diagnoses")
      .insert(diagnosesToLink);

    if (diagnosesError) {
      console.error("Error linking diagnoses to document:", diagnosesError);
      throw new Error("Failed to link diagnoses to the new document.");
    }
  }

  // Trigger background translation if notes were provided
  if (validatedData.notes) {
    supabase.functions
      .invoke("translate_medical", {
        body: {
          tableName: "patient_medical_documents",
          recordId: newDocumentId,
          fields: ["notes"], // Only 'notes' is translatable for documents
          sourceLocale: locale,
          targetLocales: getTargetLocales(locale),
        },
      })
      .catch((error) => {
        console.error(
          "Failed to invoke translate Edge Function on document create:",
          error,
        );
      });
  }

  const { error: eventUpdateError } = await supabase
    .from("patient_medical_history_events")
    .update({
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", validatedData.eventId);

  if (eventUpdateError) {
    console.error(
      "Failed to bubble up update to parent event on create:",
      eventUpdateError,
    );
    // Non-critical error, log and continue.
  }

  const { data: finalDocument, error: fetchError } = await supabase
    .from("patient_medical_documents")
    .select(
      `*,
       document_type:medical_document_types(name_translations),
       diagnoses:patient_medical_document_diagnoses(
          diagnosis_code,
          mkb_10(diagnosis_translations)
        )`,
    )
    .eq("id", newDocumentId)
    .single();

  if (fetchError) {
    console.error("Error fetching newly created document:", fetchError);
    throw new Error("Failed to retrieve the document after creation.");
  }

  const clientReadyDocument: MedicalHistoryDocumentClientModel = {
    ...finalDocument,
    ai_translation_status: finalDocument
      .ai_translation_status as AiTranslationStatus,
    document_date: new Date(finalDocument.document_date),
    document_type_translations: finalDocument.document_type.name_translations as
      | Record<string, string>
      | null,
    diagnoses: finalDocument.diagnoses.map((d) => ({
      diagnosis_code: d.diagnosis_code,
      diagnosis_translations: d.mkb_10.diagnosis_translations as
        | Record<string, string>
        | null,
    })),
    notes: finalDocument.notes as Record<string, string> | null,
  };

  return { data: clientReadyDocument };
}

/**
 * Updates an existing patient medical document.
 * Triggers background translation if notes are provided.
 * Handles optimistic locking via version checking.
 */
export async function updatePatientMedicalDocument(
  input: UpdateMedicalDocumentInput,
): Promise<{ data?: MedicalHistoryDocumentClientModel; error?: ActionError }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const validation = UpdateMedicalDocumentSchema.safeParse(input);
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
  const { id, version, wantsToRemoveFile, file: newFile, ...rest } =
    validatedData;
  const uiLocale = rest.ai_source_locale; // from client; may differ from true source

  // 1. Fetch the current document to check version, source locale, notes and old file path
  const { data: currentDoc, error: fetchError } = await supabase
    .from("patient_medical_documents")
    .select("file_path, version, event_id, ai_source_locale, notes")
    .eq("id", id)
    .single();

  if (fetchError || !currentDoc) {
    return { error: { type: "notFound", messageKey: "Errors.notFound" } };
  }

  // Optimistic locking check
  if (currentDoc.version !== version) {
    return {
      error: { type: "conflict", messageKey: "Errors.versionMismatch" },
    };
  }

  const trueSourceLocale: string = currentDoc.ai_source_locale ?? uiLocale;

  const existingNotes = (currentDoc.notes as Record<string, string> | null) ??
    null;

  const prevNotesForSource = existingNotes?.[trueSourceLocale] ?? "";

  const isEditingSourceLocale = uiLocale === trueSourceLocale;

  const notesChanged = isEditingSourceLocale &&
    (prevNotesForSource ?? "") !== (rest.notes ?? "");

  const shouldRetranslate = notesChanged;
  const hasTranslatableContent = !!rest.notes;

  const oldFilePath = currentDoc.file_path;

  // 2. Prepare the data for update (excluding notes and status for now)
  const dataToUpdate: Partial<MedicalDocumentsInsert> = {
    document_type_id: rest.documentType,
    document_date: rest.documentDate.toISOString(),
    updated_by: user.id,
    version: version + 1,
  };

  // 2a. Merge notes only when editing source locale
  if (isEditingSourceLocale) {
    const mergedNotes = rest.notes != null
      ? {
        ...(existingNotes ?? {}),
        [trueSourceLocale]: rest.notes,
      }
      : existingNotes ?? null;

    dataToUpdate.notes = mergedNotes;
  } else {
    // Keep existing notes as-is when not editing source locale
    dataToUpdate.notes = existingNotes;
  }

  // 2b. Optionally update ai_translation_status
  if (shouldRetranslate && hasTranslatableContent) {
    dataToUpdate.ai_translation_status = "in_progress";
    dataToUpdate.ai_translation_error = null;
  }

  // 3. Handle file property updates and cleanup
  const isReplacingFile = !!newFile;
  const isRemovingFile = wantsToRemoveFile && !isReplacingFile;

  if ((isReplacingFile || isRemovingFile) && oldFilePath) {
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([oldFilePath]);
    if (deleteError) {
      console.error("Failed to delete old file from storage:", deleteError);
    }
  }

  if (newFile) {
    dataToUpdate.file_path = newFile.filePath;
    dataToUpdate.file_name = newFile.fileName;
    dataToUpdate.file_size = newFile.fileSize;
    dataToUpdate.file_type = newFile.fileType;
  } else if (isRemovingFile) {
    dataToUpdate.file_path = null;
    dataToUpdate.file_name = null;
    dataToUpdate.file_size = null;
    dataToUpdate.file_type = null;
  }

  // 4. Update the document record
  const { error: updateError } = await supabase
    .from("patient_medical_documents")
    .update(dataToUpdate)
    .eq("id", id);

  if (updateError) {
    console.error("Update Medical Document Error:", updateError);
    throw new Error("A server error occurred while updating the document.");
  }

  // 4b. Synchronize diagnoses
  await supabase.from("patient_medical_document_diagnoses").delete().eq(
    "document_id",
    id,
  );

  if (rest.diagnoses && rest.diagnoses.length > 0) {
    const diagnosesToLink = rest.diagnoses.map((code) => ({
      document_id: id,
      diagnosis_code: code,
    }));
    await supabase.from("patient_medical_document_diagnoses").insert(
      diagnosesToLink,
    );
  }

  // 5. Trigger background translation if source notes changed
  if (shouldRetranslate && hasTranslatableContent) {
    supabase.functions
      .invoke("translate_medical", {
        body: {
          tableName: "patient_medical_documents",
          recordId: id,
          fields: ["notes"],
          sourceLocale: trueSourceLocale,
          targetLocales: getTargetLocales(trueSourceLocale),
        },
      })
      .catch((error) => {
        console.error(
          "Failed to invoke translate Edge Function on document update:",
          error,
        );
      });
  }

  // 6. Fetch and return the complete, updated document for the client
  const { data: finalDocument, error: finalFetchError } = await supabase
    .from("patient_medical_documents")
    .select(
      `*,
       document_type:medical_document_types(name_translations),
       diagnoses:patient_medical_document_diagnoses(
          diagnosis_code,
          mkb_10(diagnosis_translations)
        )`,
    )
    .eq("id", id)
    .single();

  if (finalFetchError) {
    console.error("Error fetching updated document:", finalFetchError);
    throw new Error("Failed to retrieve the document after updating.");
  }

  const { error: eventUpdateError } = await supabase
    .from("patient_medical_history_events")
    .update({
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", currentDoc.event_id);

  if (eventUpdateError) {
    console.error(
      "Failed to bubble up update to parent event on update:",
      eventUpdateError,
    );
  }

  const clientReadyDocument: MedicalHistoryDocumentClientModel = {
    ...finalDocument,
    ai_translation_status: finalDocument
      .ai_translation_status as AiTranslationStatus,
    document_date: new Date(finalDocument.document_date),
    document_type_translations: finalDocument.document_type
      .name_translations as Record<string, string> | null,
    diagnoses: finalDocument.diagnoses.map((d) => ({
      diagnosis_code: d.diagnosis_code,
      diagnosis_translations: d.mkb_10.diagnosis_translations as
        | Record<string, string>
        | null,
    })),
    notes: finalDocument.notes as Record<string, string> | null,
  };

  return { data: clientReadyDocument };
}
/**
 * Deletes a patient medical document and its associated file from storage.
 */
export async function deletePatientMedicalDocument(
  documentId: number,
): Promise<{ data?: { documentId: number }; error?: ActionError }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  // 1. Fetch the document to get its file path
  const { data: document, error: fetchError } = await supabase
    .from("patient_medical_documents")
    .select("file_path, event_id")
    .eq("id", documentId)
    .single();

  if (fetchError || !document) {
    return { error: { type: "notFound", messageKey: "Errors.notFound" } };
  }

  // 2. Delete the file from storage if it exists
  if (document.file_path) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([document.file_path]);
    if (storageError) {
      console.error(
        `Failed to delete file from storage: ${storageError.message}`,
      );
      // Log the error but proceed with deleting the DB record
    }
  }

  // 3. Delete the document record from the database
  // RLS and table cascades will handle deleting related diagnoses
  const { error: dbError } = await supabase
    .from("patient_medical_documents")
    .delete()
    .eq("id", documentId);

  if (dbError) {
    console.error(`Failed to delete document record: ${dbError.message}`);
    throw new Error(
      "A server error occurred while deleting the document record.",
    );
  }

  const { error: eventUpdateError } = await supabase
    .from("patient_medical_history_events")
    .update({
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", document.event_id);

  if (eventUpdateError) {
    console.error(
      "Failed to bubble up update to parent event on delete:",
      eventUpdateError,
    );
    // Non-critical error, log and continue.
  }

  return { data: { documentId } };
}
