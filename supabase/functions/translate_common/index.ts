import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type Body = {
    tableName: string;
    recordId: number;
    column: string; // e.g. "name_translations" or "translations"
    sourceLocale: string; // e.g. "en"
    targetLocales: string[]; // e.g. ["sr-Latn", "ru"]
};

async function callOpenAI({
    text,
    sourceLocale,
    targetLocales,
}: {
    text: string;
    sourceLocale: string;
    targetLocales: string[];
}): Promise<Record<string, string>> {
    console.log(
        "[translate_common] Calling OpenAI with:",
        JSON.stringify({ sourceLocale, targetLocales, text }),
    );

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-5-mini",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert translator for a business application. " +
                        "You will be given text in a source language and a list of target language codes. " +
                        "Respond ONLY with a valid JSON object, where each key is a language code from the target list " +
                        "and each value is the translated string. " +
                        "Do not include the source language key, and do not add any explanations.",
                },
                {
                    role: "user",
                    content:
                        `Translate the following text from source language "${sourceLocale}" ` +
                        `into the target languages "${
                            targetLocales.join(", ")
                        }".\n\n` +
                        `Text to translate: "${text}"`,
                },
            ],
        }),
    });

    if (!resp.ok) {
        const textBody = await resp.text();
        console.error(
            "[translate_common] OpenAI error:",
            resp.status,
            textBody,
        );
        throw new Error(`OpenAI error: ${resp.status} ${textBody}`);
    }

    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    console.log("[translate_common] Raw OpenAI content:", raw);

    const parsed = JSON.parse(raw) as Record<string, string>;
    console.log("[translate_common] Parsed OpenAI JSON:", parsed);
    return parsed;
}

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    let body: Body;
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON body", { status: 400 });
    }

    const { tableName, recordId, column, sourceLocale, targetLocales } = body;

    console.log("[translate_common] Incoming request body:", body);

    if (
        !tableName || !recordId || !column || !sourceLocale ||
        !targetLocales?.length
    ) {
        return new Response("Missing required fields", { status: 400 });
    }

    const safeTargets = targetLocales.filter((loc) => loc !== sourceLocale);

    if (safeTargets.length === 0) {
        console.log(
            "[translate_common] No safe target locales, nothing to do.",
        );
        return new Response(
            JSON.stringify({ status: "nothing_to_translate" }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    // 1. Load current row
    const { data, error } = await supabaseAdmin
        .from(tableName)
        .select(`${column}`)
        .eq("id", recordId)
        .single();

    if (error || !data) {
        console.error("[translate_common] fetch error", error);
        return new Response("Record not found", { status: 404 });
    }

    const row = data as unknown as Record<string, unknown>;
    const existing =
        (row[column] as Record<string, string> | null | undefined) ?? {};

    console.log(
        "[translate_common] Existing translations for column",
        column,
        existing,
    );

    const sourceText = existing[sourceLocale];

    if (!sourceText) {
        console.log(
            "[translate_common] No source text found for locale",
            sourceLocale,
        );
        return new Response("No source text to translate", { status: 200 });
    }

    try {
        // 2. Call OpenAI
        const translations = await callOpenAI({
            text: sourceText,
            sourceLocale,
            targetLocales: safeTargets,
        });

        // 3. Filter to only our target locales
        const filtered: Record<string, string> = {};
        for (const loc of safeTargets) {
            const value = translations[loc];
            if (typeof value === "string") {
                filtered[loc] = value;
            }
        }

        console.log("[translate_common] Filtered translations:", filtered);

        if (Object.keys(filtered).length === 0) {
            console.log(
                "[translate_common] No translations created for requested targets.",
            );
            return new Response(
                JSON.stringify({ status: "no_translations_created" }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        const merged = { ...existing, ...filtered };
        console.log(
            "[translate_common] Merged translations to be saved:",
            merged,
        );

        const { error: updateError } = await supabaseAdmin
            .from(tableName)
            .update({ [column]: merged })
            .eq("id", recordId);

        if (updateError) {
            console.error("[translate_common] update error", updateError);
            return new Response("Failed to update record", { status: 500 });
        }

        return new Response(
            JSON.stringify({
                status: "ok",
                updated_locales: Object.keys(filtered),
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (err) {
        console.error("[translate_common] OpenAI error", err);
        return new Response("Translation error", { status: 500 });
    }
});
