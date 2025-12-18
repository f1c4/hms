import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Default context if none provided
const DEFAULT_CONTEXT =
    "You are translating text for a business application. Maintain formal tone and accuracy.";

type Body = {
    tableName: string;
    recordId: number;
    column: string;
    sourceLocale: string;
    targetLocales: string[];
    context?: string;
};

async function callOpenAI({
    text,
    sourceLocale,
    targetLocales,
    context,
}: {
    text: string;
    sourceLocale: string;
    targetLocales: string[];
    context: string;
}): Promise<Record<string, string>> {
    console.log("[translate_entity] Calling OpenAI");

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `${context} ` +
                        "You will be given text in a source language and a list of target language codes. " +
                        "Respond ONLY with a valid JSON object, where each key is a language code from the target list " +
                        "and each value is the translated string. " +
                        "Do not include the source language key, and do not add any explanations.",
                },
                {
                    role: "user",
                    content:
                        `Translate from "${sourceLocale}" into "${
                            targetLocales.join(", ")
                        }".\n\n` +
                        `Text: "${text}"`,
                },
            ],
        }),
    });

    if (!resp.ok) {
        const textBody = await resp.text();
        throw new Error(`OpenAI error: ${resp.status} ${textBody}`);
    }

    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    return JSON.parse(raw) as Record<string, string>;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers":
                    "authorization, x-client-info, apikey, content-type",
            },
        });
    }

    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    let body: Body;
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON body", { status: 400 });
    }

    const {
        tableName,
        recordId,
        column,
        sourceLocale,
        targetLocales,
        context = DEFAULT_CONTEXT, // Use passed context or default
    } = body;

    if (
        !tableName || !recordId || !column || !sourceLocale ||
        !targetLocales?.length
    ) {
        return new Response("Missing required fields", { status: 400 });
    }

    const safeTargets = targetLocales.filter((loc) => loc !== sourceLocale);
    if (safeTargets.length === 0) {
        return new Response(
            JSON.stringify({ status: "nothing_to_translate" }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    // Update status to in_progress
    await supabaseAdmin
        .from(tableName)
        .update({
            ai_translation_status: "in_progress",
            ai_translation_error: null,
        })
        .eq("id", recordId)
        .then(() => {});

    // Fetch current record
    const { data, error } = await supabaseAdmin
        .from(tableName)
        .select(column)
        .eq("id", recordId)
        .single();

    if (error || !data) {
        return new Response("Record not found", { status: 404 });
    }

    const existing =
        (data as unknown as Record<string, unknown>)[column] as Record<
            string,
            string
        > ?? {};
    const sourceText = existing[sourceLocale];

    if (!sourceText) {
        await supabaseAdmin
            .from(tableName)
            .update({ ai_translation_status: "completed" })
            .eq("id", recordId);
        return new Response("No source text to translate", { status: 200 });
    }

    try {
        const translations = await callOpenAI({
            text: sourceText,
            sourceLocale,
            targetLocales: safeTargets,
            context, // Use the passed context!
        });

        const filtered: Record<string, string> = {};
        for (const loc of safeTargets) {
            if (typeof translations[loc] === "string") {
                filtered[loc] = translations[loc];
            }
        }

        if (Object.keys(filtered).length === 0) {
            await supabaseAdmin
                .from(tableName)
                .update({ ai_translation_status: "completed" })
                .eq("id", recordId);
            return new Response(
                JSON.stringify({ status: "no_translations_created" }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        const merged = { ...existing, ...filtered };

        await supabaseAdmin
            .from(tableName)
            .update({
                [column]: merged,
                ai_translation_status: "completed",
                ai_translation_error: null,
            })
            .eq("id", recordId);

        return new Response(
            JSON.stringify({
                status: "ok",
                updated_locales: Object.keys(filtered),
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (err) {
        await supabaseAdmin
            .from(tableName)
            .update({
                ai_translation_status: "failed",
                ai_translation_error: (err as Error).message?.slice(0, 1000),
            })
            .eq("id", recordId);

        return new Response("Translation error", { status: 500 });
    }
});
