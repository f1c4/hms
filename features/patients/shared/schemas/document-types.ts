import { z } from "zod";
import { DOCUMENT_TYPE_ENTITIES } from "@/types/client-models";

// Schema for validating the input for creating a new document type.
export const CreateDocumentTypeSchema = z.object({
  // Use z.enum for strict validation of the entity type
  entity: z.enum(DOCUMENT_TYPE_ENTITIES),
  // CORRECTED: z.record now correctly specifies a string key and a string value.
  translations: z.record(z.string(), z.string()).refine(
    (translations) => {
      // Ensure the default language 'en' is present and not empty.
      return translations.en && translations.en.trim() !== "";
    },
    { message: "A default (English) translation is required." }
  ),
});

// Schema for validating the input for updating a document type.
export const UpdateDocumentTypeSchema = z.object({
  id: z.number().min(1),
  translations: z.record(z.string(), z.string()).refine(
    (translations) => {
      return translations.en && translations.en.trim() !== "";
    },
    { message: "A default (English) translation is required." }
  ),
});