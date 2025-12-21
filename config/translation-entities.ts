/**
 * Translation entity types and their AI prompt contexts.
 * This is the single source of truth for entity-aware translations.
 */

export const TRANSLATION_ENTITIES = {
    profession: "profession",
    city: "city",
    document_type: "document_type",
    medical_term: "medical_term",
    medical_document: "medical_document",
    service: "service",
    insurance: "insurance",
    examination_type: "examination_type",
} as const;

export type TranslationEntity =
    typeof TRANSLATION_ENTITIES[keyof typeof TRANSLATION_ENTITIES];

/**
 * AI prompt contexts for each entity type.
 * These provide domain-specific guidance for more accurate translations.
 */
export const ENTITY_CONTEXTS: Record<TranslationEntity, string> = {
    profession:
        "You are translating job titles and professional occupations. " +
        "Use formal, standardized terms appropriate for official documents and medical records. " +
        "Preserve the professional meaning accurately across languages.",
    city: "You are translating city/place names. " +
        "Use the official or commonly accepted name in each target language. " +
        "Some cities have established translations (e.g., Moscow/Москва/Moskva), use those when applicable.",
    document_type:
        "You are translating document type names for administrative use. " +
        "Use precise, official terminology appropriate for business contexts.",
    medical_term: "You are translating medical terminology. " +
        "Use accurate medical/clinical terms. Prioritize clarity and precision over literal translation.",
    medical_document: "You are translating names of medical document types. " +
        "Use standard medical/healthcare terminology appropriate for clinical documentation.",
    service: "You are translating names of medical services and procedures. " +
        "Use standard medical terminology appropriate for healthcare documentation.",
    insurance: "You are translating insurance-related terms. " +
        "Use standard insurance industry terminology.",
    examination_type:
        "You are translating medical examination type information for a healthcare clinic application. " +
        "Use accurate medical terminology. Keep translations professional and clear for both patients and medical staff. " +
        "For preparation instructions, ensure clarity so patients understand requirements like fasting.",
};

/**
 * Helper to get the context for an entity type.
 * Returns a default context if entity is not found.
 */
export function getEntityContext(entity: TranslationEntity | string): string {
    return ENTITY_CONTEXTS[entity as TranslationEntity] ??
        "You are translating text for a business/healthcare application. Maintain formal tone and accuracy.";
}
