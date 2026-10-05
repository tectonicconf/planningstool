"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { getShiftsForVolunteer } from "@/lib/shifts";
import { sendConfirmationEmail } from "@/lib/email";

export type AssignmentResponse = "accept" | "decline";

export type RespondToAssignmentResult =
  | { ok: true }
  | { ok: false; error: string };

// Ownership is re-derived from the token on every call rather than trusted
// from the client, and only a still-`pending` row for that volunteer can be
// changed — see AGENTS.md / Next.js data-security guide on Server Actions.
export async function respondToAssignment(
  token: string,
  assignmentId: number,
  response: AssignmentResponse,
): Promise<RespondToAssignmentResult> {
  const { data: volunteer, error: volunteerError } = await supabaseAdmin
    .from("volunteers")
    .select("id, first_name, email")
    .eq("magic_link_token", token)
    .maybeSingle();

  if (volunteerError || !volunteer) {
    return { ok: false, error: "Volunteer not found." };
  }

  const newStatus = response === "accept" ? "confirmed" : "cancelled";
  // Accepting only makes sense from a still-pending invite; declining/cancelling
  // is allowed from pending (decline an invite) or confirmed (cancel after accepting).
  const allowedCurrentStatuses =
    response === "accept" ? ["pending"] : ["pending", "confirmed"];

  const { data, error } = await supabaseAdmin
    .from("assignments")
    .update({ status: newStatus })
    .eq("id", assignmentId)
    .eq("volunteer_id", volunteer.id)
    .in("status", allowedCurrentStatuses)
    .select("id");

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return { ok: false, error: "This shift can no longer be updated." };
  }

  if (response === "accept" && volunteer.email) {
    try {
      const confirmedShifts = (
        await getShiftsForVolunteer(volunteer.id)
      ).filter((shift) => shift.status === "confirmed");

      const confirmedShift = confirmedShifts.find(
        (shift) => shift.assignmentId === assignmentId,
      );

      if (confirmedShift) {
        await sendConfirmationEmail({
          to: volunteer.email,
          firstName: volunteer.first_name,
          token,
          confirmedShift,
          allConfirmedShifts: confirmedShifts,
        });
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }
  }

  return { ok: true };
}
