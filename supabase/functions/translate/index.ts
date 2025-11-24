import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

// Remove the OpenAI SDK import
// import OpenAI from "https://esm.sh/openai@6.9.1";

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
    const supabase = createClient(
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!,
      Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")!,
    );

    const { recordId, tableName, sourceLocale, targetLocales, fields } =
      await req.json();

    if (!recordId || !tableName || !sourceLocale || !targetLocales || !fields) {
      throw new Error("Missing required parameters in the request body.");
    }

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

    for (const fieldName of fields) {
      const sourceJson = originalRecord[fieldName];
      if (!sourceJson || typeof sourceJson !== "object") continue;

      const textToTranslate = sourceJson[sourceLocale];
      if (!textToTranslate) continue;

      const completion = await createChatCompletionJSON({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content:
              `You are an expert translator for a medical application. You will be given a text in a source language and a list of target language codes. Your task is to translate the text into each of the target languages. Respond ONLY with a valid JSON object where each key is a language code from the target list and the value is the translated string. Do not include the source language in your response.`,
          },
          {
            role: "user",
            content:
              `Translate the following text from source language "${sourceLocale}" into the target languages "${
                targetLocales.join(
                  ", ",
                )
              }".\n\nText to translate: "${textToTranslate}"`,
          },
        ],
      });

      const result = completion.choices?.[0]?.message?.content;
      if (!result) continue;

      const newTranslations = JSON.parse(result);

      updatePayload[fieldName] = {
        ...(sourceJson as Record<string, string>),
        ...newTranslations,
      };

      console.log(`Translated field "${fieldName}":`, newTranslations);
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabase
        .from(tableName)
        .update(updatePayload)
        .eq("id", recordId);

      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in translate function:", (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
