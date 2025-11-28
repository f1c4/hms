import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

// Helper to call OpenAI Chat Completions
async function createChatCompletionJSON(params: {
  model: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
}) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      ...params,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ||
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!;
    // Use SERVICE_ROLE_KEY for internal operations to bypass RLS
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseServiceKey) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
    );

    const { recordId, tableName, sourceLocale, targetLocales, fields } =
      await req.json();

    if (!recordId || !tableName || !sourceLocale || !targetLocales || !fields) {
      throw new Error("Missing required parameters in the request body.");
    }

    // Mark translation as in progress
    await supabase
      .from(tableName)
      .update({
        ai_translation_status: "in_progress",
        ai_translation_error: null,
      })
      .eq("id", recordId);

    const { data: originalRecord, error: fetchError } = await supabase
      .from(tableName)
      .select(fields.join(","))
      .eq("id", recordId)
      .single();

    if (fetchError) throw fetchError;
    if (!originalRecord) {
      throw new Error(
        `Record with ID ${recordId} not found in table ${tableName}.`,
      );
    }

    const updatePayload: { [key: string]: unknown } = {};
    const safeTargets: string[] = (targetLocales as string[]).filter(
      (loc) => loc !== sourceLocale,
    );
    const typedRecord = originalRecord as unknown as Record<string, unknown>;

    for (const fieldName of fields as string[]) {
      const sourceJson = typedRecord[fieldName];
      if (!sourceJson || typeof sourceJson !== "object") continue;

      const textToTranslate =
        (sourceJson as Record<string, string>)[sourceLocale];
      if (!textToTranslate) continue;

      const completion = await createChatCompletionJSON({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert translator for a medical application. " +
              "You will be given a text in a source language and a list of target language codes. " +
              "Respond ONLY with a valid JSON object where each key is a language code from the target list " +
              "and the value is the translated string. Do not include the source language in your response.",
          },
          {
            role: "user",
            content:
              `Translate the following text from source language "${sourceLocale}" ` +
              `into the target languages "${safeTargets.join(", ")}".\n\n` +
              `Text to translate: "${textToTranslate}"`,
          },
        ],
      });

      const result = completion.choices?.[0]?.message?.content;
      if (!result) continue;

      const rawTranslations = JSON.parse(result) as Record<string, string>;

      const filteredTranslations = Object.fromEntries(
        Object.entries(rawTranslations).filter(([loc]) =>
          safeTargets.includes(loc)
        ),
      );

      if (Object.keys(filteredTranslations).length === 0) continue;

      updatePayload[fieldName] = {
        ...(sourceJson as Record<string, string>),
        ...filteredTranslations,
      };

      console.log(`Translated field "${fieldName}":`, filteredTranslations);
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabase
        .from(tableName)
        .update({
          ...updatePayload,
          ai_translation_status: "completed",
          ai_translation_error: null,
        })
        .eq("id", recordId);

      if (updateError) throw updateError;
    } else {
      // Nothing to translate; treat as completed
      await supabase
        .from(tableName)
        .update({
          ai_translation_status: "completed",
          ai_translation_error: null,
        })
        .eq("id", recordId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    const message = (error as Error).message ?? "Unknown error";
    console.error("Error in translate function:", message);

    // Best-effort update of status to failed
    try {
      const { recordId, tableName } = await req.json();
      if (recordId && tableName) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ||
          Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
          Deno.env.get("SERVICE_ROLE_KEY");

        if (supabaseServiceKey) {
          await createClient(supabaseUrl, supabaseServiceKey)
            .from(tableName)
            .update({
              ai_translation_status: "failed",
              ai_translation_error: message.slice(0, 1000),
            })
            .eq("id", recordId);
        }
      }
    } catch {
      // ignore secondary failures
    }

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
