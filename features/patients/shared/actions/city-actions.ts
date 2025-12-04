"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { getTargetLocales } from "@/i18n/locale-config";

// Schema for validating new city data
const CreateCitySchema = z.object({
  name: z.string().min(2, "City name is too short."),
  postal_code: z.string().min(1, "Postal code is required."),
  country_id: z.number(),
  source_locale: z.string(),
});

/**
 * Server action to create a new city in the database.
 * Triggers background LLM translation for the city name.
 */
export async function createCity(formData: {
  name: string;
  postal_code: string;
  country_id: number;
  source_locale: string;
}) {
  const client = await createClient();
  const validation = CreateCitySchema.safeParse(formData);

  if (!validation.success) {
    throw new Error(validation.error.issues.map((e) => e.message).join(", "));
  }

  const { name, postal_code, country_id, source_locale } = validation.data;

  const { data, error } = await client
    .from("cities")
    .insert({
      name: { [source_locale]: name },
      postal_code,
      country_id,
    })
    .select("id, name, postal_code")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`City '${name}' already exists for this country.`);
    }
    console.error("Create City Error:", error.message);
    throw new Error("Failed to create new city.");
  }

  // Fire-and-forget translation using translate_common
  client.functions
    .invoke("translate_common", {
      body: {
        tableName: "cities",
        recordId: data.id,
        column: "name",
        sourceLocale: source_locale,
        targetLocales: getTargetLocales(source_locale),
      },
    })
    .catch((err) => {
      console.error("Failed to invoke translate_common for city:", err);
    });

  return data;
}

// --- UPDATE ACTION ---

const UpdateCitySchema = z.object({
  id: z.number(),
  name: z.string().min(2, "City name is too short."),
  postal_code: z.string().min(1, "Postal code is required."),
  source_locale: z.string(),
});

/**
 * Server action to update an existing city in the database.
 * Re-triggers translation if the name changed.
 */
export async function updateCity(formData: {
  id: number;
  name: string;
  postal_code: string;
  source_locale: string;
}) {
  const client = await createClient();
  const validation = UpdateCitySchema.safeParse(formData);

  if (!validation.success) {
    throw new Error(validation.error.issues.map((e) => e.message).join(", "));
  }

  const { id, name, postal_code, source_locale } = validation.data;

  // Fetch existing name to check if translation is needed
  const { data: existing } = await client
    .from("cities")
    .select("name")
    .eq("id", id)
    .single();

  const existingName = (existing?.name as Record<string, string> | null)
    ?.[source_locale];
  const nameChanged = existingName !== name;

  // Merge new name into existing translations
  const mergedName = {
    ...((existing?.name as Record<string, string>) ?? {}),
    [source_locale]: name,
  };

  const { data, error } = await client
    .from("cities")
    .update({
      name: mergedName,
      postal_code,
    })
    .eq("id", id)
    .select("id, name, postal_code")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`A city named '${name}' already exists in this country.`);
    }
    console.error("Update City Error:", error.message);
    throw new Error("Failed to update city.");
  }

  // Re-translate if name changed
  if (nameChanged) {
    client.functions
      .invoke("translate_common", {
        body: {
          tableName: "cities",
          recordId: id,
          column: "name",
          sourceLocale: source_locale,
          targetLocales: getTargetLocales(source_locale),
        },
      })
      .catch((err) => {
        console.error(
          "Failed to invoke translate_common for city update:",
          err,
        );
      });
  }

  return data;
}
