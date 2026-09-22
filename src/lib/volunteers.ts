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
    .select('firstName:"First Name", lastName:"Last Name"')
    .eq("Respondent ID", token)
    .maybeSingle();

  if (error) {
    console.error("Failed to look up volunteer by token:", error.message);
    return null;
  }

  return data;
}
