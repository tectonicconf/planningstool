"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { getShiftsForVolunteer } from "@/lib/shifts";
import {
  sendConfirmationEmail,
  sendCancellationEmail,
  sendTemplateConfirmationEmail,
  sendTemplateCancellationEmail,
} from "@/lib/email";
import { logActivity } from "@/lib/activityLog";
import { getCancellationsEnabled } from "@/lib/appSettings";

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

  // Fetched before the update purely so the activity log can tell "declined
  // an invite" (was pending) apart from "cancelled after accepting" (was
  // confirmed) — the update itself only returns the new row.
  const { data: before } = await supabaseAdmin
    .from("assignments")
    .select("status")
    .eq("id", assignmentId)
    .eq("volunteer_id", volunteer.id)
    .maybeSingle();

  // Only gates an actual cancel (was already confirmed) — declining a
  // still-pending invite is always allowed regardless of this setting.
  if (response === "decline" && before?.status === "confirmed" && !(await getCancellationsEnabled())) {
    return {
      ok: false,
      error: "You can no longer cancel a confirmed shift through the platform. Call or text the People team on WhatsApp at +32 451 05 54 92 if you can no longer make it.",
    };
  }

  const { data, error } = await supabaseAdmin
    .from("assignments")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", assignmentId)
    .eq("volunteer_id", volunteer.id)
    .in("status", allowedCurrentStatuses)
    .select("id, shift_id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "This shift can no longer be updated." };
  }

  await logActivity({
    eventType:
      response === "accept" ? "confirmed" : before?.status === "confirmed" ? "cancelled" : "declined",
    actorType: "volunteer",
    volunteerId: volunteer.id,
    shiftId: data.shift_id,
    assignmentId: data.id,
  });

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
        });
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }
  }

  if (response === "decline" && volunteer.email) {
    try {
      const { data: shift } = await supabaseAdmin
        .from("shifts")
        .select("date, start_time, end_time, location, role_category")
        .eq("id", data.shift_id)
        .maybeSingle();

      if (shift) {
        await sendCancellationEmail({
          to: volunteer.email,
          firstName: volunteer.first_name,
          token,
          cancelledShift: {
            date: shift.date,
            startTime: shift.start_time,
            endTime: shift.end_time,
            location: shift.location,
            shiftType: shift.role_category,
          },
        });
      }
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
    }
  }

  return { ok: true };
}

// A template's blocks are meant to be accepted/declined as one unit — see
// ShiftDashboard.tsx's grouping by `Shift.templateKey`. Scoped and validated
// exactly like `respondToAssignment` above, just over several assignment ids
// at once, with a single summary email instead of one per block.
export async function respondToAssignments(
  token: string,
  assignmentIds: number[],
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
  const allowedCurrentStatuses =
    response === "accept" ? ["pending"] : ["pending", "confirmed"];

  // Same reasoning as the single-assignment version above — fetched before
  // the update so a bulk decline (which can hit a mix of pending and
  // already-confirmed blocks in one call) logs the correct event per block.
  const { data: before } = await supabaseAdmin
    .from("assignments")
    .select("id, status")
    .in("id", assignmentIds)
    .eq("volunteer_id", volunteer.id);
  const statusBeforeById = new Map((before ?? []).map((row) => [row.id, row.status]));

  // A template's blocks are accepted/declined as one unit (see the comment
  // above), so if any of them is already confirmed this is a genuine cancel,
  // not a decline of a still-pending invite — gate the whole batch rather
  // than letting it cancel some blocks and silently skip others.
  const anyAlreadyConfirmed = Array.from(statusBeforeById.values()).some(
    (status) => status === "confirmed",
  );
  if (response === "decline" && anyAlreadyConfirmed && !(await getCancellationsEnabled())) {
    return {
      ok: false,
      error: "You can no longer cancel a confirmed shift through the platform. Call or text the People team on WhatsApp at +32 451 05 54 92 if you can no longer make it.",
    };
  }

  const { data, error } = await supabaseAdmin
    .from("assignments")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .in("id", assignmentIds)
    .eq("volunteer_id", volunteer.id)
    .in("status", allowedCurrentStatuses)
    .select("id, shift_id");

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return { ok: false, error: "This template can no longer be updated." };
  }

  const updatedIds = new Set(data.map((row) => row.id));

  await Promise.all(
    data.map((row) =>
      logActivity({
        eventType:
          response === "accept"
            ? "confirmed"
            : statusBeforeById.get(row.id) === "confirmed"
              ? "cancelled"
              : "declined",
        actorType: "volunteer",
        volunteerId: volunteer.id,
        shiftId: row.shift_id,
        assignmentId: row.id,
      }),
    ),
  );

  if (response === "accept" && volunteer.email) {
    try {
      const confirmedShifts = (await getShiftsForVolunteer(volunteer.id)).filter(
        (shift) => shift.status === "confirmed" && updatedIds.has(shift.assignmentId),
      );

      if (confirmedShifts.length === 1) {
        await sendConfirmationEmail({
          to: volunteer.email,
          firstName: volunteer.first_name,
          token,
          confirmedShift: confirmedShifts[0],
        });
      } else if (confirmedShifts.length > 1) {
        await sendTemplateConfirmationEmail({
          to: volunteer.email,
          firstName: volunteer.first_name,
          token,
          confirmedShifts,
        });
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }
  }

  if (response === "decline" && volunteer.email) {
    try {
      const shiftIds = data.map((row) => row.shift_id);
      const { data: shiftRows } = await supabaseAdmin
        .from("shifts")
        .select("date, start_time, end_time, location, role_category")
        .in("id", shiftIds);

      if (shiftRows && shiftRows.length === 1) {
        const shift = shiftRows[0];
        await sendCancellationEmail({
          to: volunteer.email,
          firstName: volunteer.first_name,
          token,
          cancelledShift: {
            date: shift.date,
            startTime: shift.start_time,
            endTime: shift.end_time,
            location: shift.location,
            shiftType: shift.role_category,
          },
        });
      } else if (shiftRows && shiftRows.length > 1) {
        await sendTemplateCancellationEmail({
          to: volunteer.email,
          firstName: volunteer.first_name,
          token,
          cancelledShifts: shiftRows.map((shift) => ({
            date: shift.date,
            startTime: shift.start_time,
            endTime: shift.end_time,
            location: shift.location,
            shiftType: shift.role_category,
          })),
        });
      }
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
    }
  }

  return { ok: true };
}
