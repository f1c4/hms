import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";
import OpenAI from "https://esm.sh/openai@6.8.1";

// Initialize the OpenAI client.
// For local dev, you might need to pass the key directly if the .env file isn't working.
// For production, it will read the OPENAI_API_KEY from the secrets you set.
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")!,
});

// This is the main function that will be executed when the edge function is invoked.
serve(async (req: Request) => {
  // This is required for CORS to allow the function to be called from a browser or server
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
    // Create a Supabase client with the service_role key to bypass RLS for this trusted operation
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get the data passed to the function from our server action
    const { recordId, tableName, sourceLocale, targetLocales, fields } =
      await req.json();

    if (!recordId || !tableName || !sourceLocale || !targetLocales || !fields) {
      throw new Error("Missing required parameters in the request body.");
    }

    // Fetch the original record to get the existing JSONB data
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

    // Loop through each field name that needs translation (e.g., 'title', 'notes')
    for (const fieldName of fields) {
      const sourceJson = originalRecord[fieldName];
      // Ensure the field exists and is an object (JSONB)
      if (!sourceJson || typeof sourceJson !== "object") continue;

      // Get the text to translate from the source locale (e.g., the 'en' value)
      const textToTranslate = sourceJson[sourceLocale];
      if (!textToTranslate) continue; // Skip if no source text exists for this field

      // Call the OpenAI API
      const response = await openai.chat.completions.create({
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
              }".

          Text to translate: "${textToTranslate}"`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = response.choices[0].message.content;
      if (!result) continue;

      const newTranslations = JSON.parse(result);

      // Merge new translations with the existing JSONB data for that field
      updatePayload[fieldName] = {
        ...(sourceJson as Record<string, string>),
        ...newTranslations,
      };

      console.log(`Translated field "${fieldName}":`, newTranslations);
    }

    // Update the record in the database with the newly translated fields
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
