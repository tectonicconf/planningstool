"use server";

import { supabaseAdmin } from "@/lib/supabase";

export type Volunteer = {
  firstName: string;
  lastName: string;
};

export async function getVolunteerByToken(
  token: string,
): Promise<Volunteer | null> {
  const { data, error } = await supabaseAdmin
    .from("volunteers")
    .select("firstName:first_name, lastName:last_name")
    .eq("magic_link_token", token)
    .maybeSingle();

  if (error) {
    console.error("Failed to look up volunteer by token:", error.message);
    return null;
  }

  return data;
}
