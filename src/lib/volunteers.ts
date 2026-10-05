"use server";

import { supabaseAdmin } from "@/lib/supabase";

export type Volunteer = {
  id: string;
  firstName: string;
  lastName: string;
  quizCompleted: boolean;
};

export async function getVolunteerByToken(
  token: string,
): Promise<Volunteer | null> {
  const { data, error } = await supabaseAdmin
    .from("volunteers")
    .select("id, firstName:first_name, lastName:last_name, quizCompleted:quiz")
    .eq("magic_link_token", token)
    .maybeSingle();

  if (error) {
    console.error("Failed to look up volunteer by token:", error.message);
    return null;
  }

  return data;
}
