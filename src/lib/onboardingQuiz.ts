"use server";

import { supabaseAdmin } from "@/lib/supabase";

export type CompleteQuizResult = { ok: true } | { ok: false; error: string };

// Ownership is re-derived from the token, same pattern as respondToAssignment
// in assignments.ts — never trust a volunteer id passed from the client.
export async function completeOnboardingQuiz(
  token: string,
): Promise<CompleteQuizResult> {
  const { data: volunteer, error: volunteerError } = await supabaseAdmin
    .from("volunteers")
    .select("id")
    .eq("magic_link_token", token)
    .maybeSingle();

  if (volunteerError || !volunteer) {
    return { ok: false, error: "Volunteer not found." };
  }

  const { error } = await supabaseAdmin
    .from("volunteers")
    .update({ quiz: true })
    .eq("id", volunteer.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
