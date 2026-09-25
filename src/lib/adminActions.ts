"use server";

import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { isVolunteerAvailableForShift, hasOverlap } from "@/lib/shiftEligibility";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function generateMagicLinkToken() {
  return randomUUID().replace(/-/g, "");
}

async function nextAssignmentId(): Promise<number> {
  const { data } = await supabaseAdmin
    .from("assignments")
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  return (data?.[0]?.id ?? 0) + 1;
}

async function nextShiftId(): Promise<string> {
  const { data } = await supabaseAdmin.from("shifts").select("id");

  const maxNumber = (data ?? []).reduce((max, row) => {
    const match = /^S(\d+)$/.exec(row.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `S${String(maxNumber + 1).padStart(3, "0")}`;
}

export async function createShift(input: {
  date: string;
  slot: string;
  startTime: string;
  endTime: string;
  hours: number;
  location: string;
  roleCategory: string;
  volunteersNeeded: number;
  eventContext: string;
}): Promise<ActionResult<{ id: string }>> {
  const id = await nextShiftId();

  const day = new Date(`${input.date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
  });

  const { error } = await supabaseAdmin.from("shifts").insert({
    id,
    date: input.date,
    day,
    slot: input.slot,
    start_time: input.startTime,
    end_time: input.endTime,
    hours: input.hours,
    location: input.location,
    role_category: input.roleCategory,
    volunteers_needed: input.volunteersNeeded,
    event_context: input.eventContext,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { id } };
}

export async function deleteShift(shiftId: string): Promise<ActionResult> {
  const { error: assignmentsError } = await supabaseAdmin
    .from("assignments")
    .delete()
    .eq("shift_id", shiftId);

  if (assignmentsError) {
    return { ok: false, error: assignmentsError.message };
  }

  const { error } = await supabaseAdmin
    .from("shifts")
    .delete()
    .eq("id", shiftId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: undefined };
}

export async function addVolunteerToShift(
  shiftId: string,
  volunteerId: string,
): Promise<ActionResult<{ assignmentId: number }>> {
  const { data: shift, error: shiftError } = await supabaseAdmin
    .from("shifts")
    .select("id, date, slot, start_time, end_time")
    .eq("id", shiftId)
    .maybeSingle();

  if (shiftError || !shift) {
    return { ok: false, error: "Shift not found." };
  }

  const { data: existing } = await supabaseAdmin
    .from("assignments")
    .select("id")
    .eq("shift_id", shiftId)
    .eq("volunteer_id", volunteerId)
    .in("status", ["pending", "confirmed"])
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "This volunteer is already on this shift." };
  }

  const { data: volunteer, error: volunteerError } = await supabaseAdmin
    .from("volunteers")
    .select("availability")
    .eq("id", volunteerId)
    .maybeSingle();

  if (volunteerError || !volunteer) {
    return { ok: false, error: "Volunteer not found." };
  }

  const availabilityEntries = (volunteer.availability ?? "")
    .split(";")
    .map((entry: string) => entry.trim())
    .filter(Boolean);

  const shiftInfo = {
    date: shift.date,
    slot: shift.slot,
    startTime: shift.start_time,
    endTime: shift.end_time,
  };

  if (!isVolunteerAvailableForShift(availabilityEntries, shiftInfo)) {
    return {
      ok: false,
      error: "This volunteer is not available for this shift's date/time.",
    };
  }

  const { data: activeAssignments } = await supabaseAdmin
    .from("assignments")
    .select("shift_id")
    .eq("volunteer_id", volunteerId)
    .in("status", ["pending", "confirmed"]);

  const otherShiftIds = (activeAssignments ?? [])
    .map((a) => a.shift_id)
    .filter((id) => id !== shiftId);

  if (otherShiftIds.length > 0) {
    const { data: otherShifts } = await supabaseAdmin
      .from("shifts")
      .select("date, start_time, end_time")
      .in("id", otherShiftIds);

    const overlaps = hasOverlap(
      { date: shiftInfo.date, startTime: shiftInfo.startTime, endTime: shiftInfo.endTime },
      (otherShifts ?? []).map((s) => ({
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
      })),
    );

    if (overlaps) {
      return {
        ok: false,
        error: "This volunteer already has an overlapping shift.",
      };
    }
  }

  const { data, error } = await supabaseAdmin
    .from("assignments")
    .insert({
      id: await nextAssignmentId(),
      volunteer_id: volunteerId,
      shift_id: shiftId,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Failed to add volunteer." };
  }

  return { ok: true, data: { assignmentId: data.id } };
}

export async function removeAssignment(
  assignmentId: number,
): Promise<ActionResult> {
  const { error } = await supabaseAdmin
    .from("assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: undefined };
}

export async function createVolunteer(input: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  association: string;
}): Promise<ActionResult<{ id: string; magicLinkToken: string }>> {
  const id = `manual_${randomUUID().slice(0, 8)}`;
  const magicLinkToken = generateMagicLinkToken();

  const { error } = await supabaseAdmin.from("volunteers").insert({
    id,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone_number: input.phoneNumber,
    association: input.association,
    wants_responsibility: false,
    is_backup: false,
    approval_status: "approved",
    uploaded_video: false,
    magic_link_token: magicLinkToken,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { id, magicLinkToken } };
}
