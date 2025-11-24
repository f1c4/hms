"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// Schema for validating new city data
const CreateCitySchema = z.object({
  name: z.string().min(2, "City name is too short."),
  postal_code: z.string().min(1, "Postal code is required."),
  country_id: z.number(),
});

/**
 * Server action to create a new city in the database.
 * It returns the newly created city object.
 */
export async function createCity(formData: {
  name: string;
  postal_code: string;
  country_id: number;
}) {
  const client = await createClient();
  const validation = CreateCitySchema.safeParse(formData);

  if (!validation.success) {
    throw new Error(validation.error.issues.map((e) => e.message).join(", "));
  }

  const { data, error } = await client
    .from("cities")
    .insert(validation.data)
    .select("id, name, postal_code")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`City '${formData.name}' already exists for this country.`);
    }
    console.error("Create City Error:", error.message);
    throw new Error("Failed to create new city.");
  }

  return data;
}

// --- NEW UPDATE ACTION ---

// Schema for validating city updates. Requires the city's ID.
const UpdateCitySchema = z.object({
  id: z.number(),
  name: z.string().min(2, "City name is too short."),
  postal_code: z.string().min(1, "Postal code is required."),
});

/**
 * Server action to update an existing city in the database.
 * It returns the updated city object.
 */
export async function updateCity(formData: {
  id: number;
  name: string;
  postal_code: string;
}) {
  const client = await createClient();
  const validation = UpdateCitySchema.safeParse(formData);

  if (!validation.success) {
    throw new Error(validation.error.issues.map((e) => e.message).join(", "));
  }

  const { id, ...dataToUpdate } = validation.data;

  const { data, error } = await client
    .from("cities")
    .update(dataToUpdate)
    .eq("id", id)
    .select("id, name, postal_code")
    .single();

  if (error) {
    // Handle potential unique constraint violation on update
    if (error.code === "23505") {
      throw new Error(`A city named '${formData.name}' already exists in this country.`);
    }
    console.error("Update City Error:", error.message);
    throw new Error("Failed to update city.");
  }

  return data;
}