"use server";

import { createClient } from "@/utils/supabase/server";
import { getTargetLocales } from "@/i18n/locale-config";
import {
    getEntityContext,
    TranslationEntity,
} from "@/config/translation-entities";

export interface TranslateEntityParams {
    tableName: string;
    recordId: number;
    column: string;
    sourceLocale: string;
    entity: TranslationEntity;
}

/**
 * Triggers AI translation for an entity.
 * Fire-and-forget pattern - returns immediately, translation happens in background.
 */
export async function triggerEntityTranslation({
    tableName,
    recordId,
    column,
    sourceLocale,
    entity,
}: TranslateEntityParams): Promise<void> {
    const supabase = await createClient();
    const targetLocales = getTargetLocales(sourceLocale);
    const context = getEntityContext(entity);

    supabase.functions
        .invoke("translate_entity", {
            body: {
                tableName,
                recordId,
                column,
                sourceLocale,
                targetLocales,
                context,
            },
        })
        .catch((err) => {
            console.error(`translate_entity for ${entity} failed:`, err);
        });
}
