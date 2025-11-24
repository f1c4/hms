"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import { Database } from "@/types/database-custom";
import { DocumentTypeEntity } from "@/types/client-models";
import { CreateDocumentTypeSchema, UpdateDocumentTypeSchema } from "../schemas/document-types";

type DocumentTypeInsert = Database["public"]["Tables"]["document_types"]["Insert"];
type DocumentTypeUpdate = z.infer<typeof UpdateDocumentTypeSchema>;

// --- GET ---

/**
 * Fetches a list of document types from the database, filtered by a specific entity.
 * This is used to populate select dropdowns in forms.
 * @param entity The entity to filter by (e.g., 'identity_document', 'medical_record').
 * @returns A promise that resolves to an array of document types with their translations.
 */
export async function getDocumentTypesByEntity(entity: DocumentTypeEntity) {
    noStore(); // This data is dynamic and should not be cached across requests.
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("document_types")
        .select("id, translations")
        .eq("entity", entity);

    if (error) {
        console.error("Error fetching document types by entity:", error);
        throw new Error(`Could not fetch document types for entity: ${entity}`);
    }

    return data;
}

// --- CREATE ---

export async function createDocumentType(formData: DocumentTypeInsert) {
    const validationResult = CreateDocumentTypeSchema.safeParse(formData);

    if (!validationResult.success) {
        return { error: { message: "Invalid input.", issues: validationResult.error.issues } };
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: { message: "Authentication required." } };
    }

    const { error } = await supabase.from("document_types").insert([
        {
            ...validationResult.data,
            created_by: user.id,
        },
    ]);

    if (error) {
        console.error("Error creating document type:", error);
        return { error: { message: "Database error: Could not create document type." } };
    }

    return { data: { message: "Document type created successfully." } };
}

// --- UPDATE ---

export async function updateDocumentType(formData: DocumentTypeUpdate) {
    const validationResult = UpdateDocumentTypeSchema.safeParse(formData);

    if (!validationResult.success) {
        return { error: { message: "Invalid input.", issues: validationResult.error.issues } };
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: { message: "Authentication required." } };
    }

    const { error } = await supabase
        .from("document_types")
        .update({
            translations: validationResult.data.translations,
            updated_by: user.id,
        })
        .eq("id", validationResult.data.id);

    if (error) {
        console.error("Error updating document type:", error);
        return { error: { message: "Database error: Could not update document type." } };
    }

    return { data: { message: "Document type updated successfully." } };
}
