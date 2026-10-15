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

// Shifts created here (as opposed to the optimizer's "S0xx"-numbered CSV
// import) get a random id, same pattern as manually-added volunteers
// (`manual_${randomUUID()...}` below) — no need to scan existing rows for
// the highest number, and nothing to break if other ids don't follow a
// fixed pattern.
function generateShiftId(): string {
  return `manualshift_${randomUUID().slice(0, 8)}`;
}

export async function createShift(input: {
  date: string;
  endDate: string;
  slot: string;
  startTime: string;
  endTime: string;
  hours: number;
  location: string;
  roleCategory: string;
  volunteersNeeded: number;
  eventContext: string;
}): Promise<ActionResult<{ id: string }>> {
  const id = generateShiftId();

  const day = new Date(`${input.date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
  });

  const { error } = await supabaseAdmin.from("shifts").insert({
    id,
    date: input.date,
    end_date: input.endDate,
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
  const [
    { data: shift, error: shiftError },
    { data: existing },
    { data: volunteer, error: volunteerError },
    { data: activeAssignments },
  ] = await Promise.all([
    supabaseAdmin
      .from("shifts")
      .select("id, date, end_date, slot, start_time, end_time")
      .eq("id", shiftId)
      .maybeSingle(),
    supabaseAdmin
      .from("assignments")
      .select("id")
      .eq("shift_id", shiftId)
      .eq("volunteer_id", volunteerId)
      .in("status", ["pending", "confirmed"])
      .maybeSingle(),
    supabaseAdmin
      .from("volunteers")
      .select("availability")
      .eq("id", volunteerId)
      .maybeSingle(),
    supabaseAdmin
      .from("assignments")
      .select("shift_id")
      .eq("volunteer_id", volunteerId)
      .in("status", ["pending", "confirmed"]),
  ]);

  if (shiftError || !shift) {
    return { ok: false, error: "Shift not found." };
  }

  if (existing) {
    return { ok: false, error: "This volunteer is already on this shift." };
  }

  if (volunteerError || !volunteer) {
    return { ok: false, error: "Volunteer not found." };
  }

  const availabilityEntries = (volunteer.availability ?? "")
    .split(";")
    .map((entry: string) => entry.trim())
    .filter(Boolean);

  const shiftInfo = {
    date: shift.date,
    endDate: shift.end_date,
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

  const otherShiftIds = (activeAssignments ?? [])
    .map((a) => a.shift_id)
    .filter((id) => id !== shiftId);

  if (otherShiftIds.length > 0) {
    const { data: otherShifts } = await supabaseAdmin
      .from("shifts")
      .select("date, end_date, start_time, end_time")
      .in("id", otherShiftIds);

    const overlaps = hasOverlap(
      {
        date: shiftInfo.date,
        endDate: shiftInfo.endDate,
        startTime: shiftInfo.startTime,
        endTime: shiftInfo.endTime,
      },
      (otherShifts ?? []).map((s) => ({
        date: s.date,
        endDate: s.end_date,
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

export async function setAssignmentCheckedIn(
  assignmentId: number,
  checkedIn: boolean,
): Promise<ActionResult<{ checkedInAt: string | null }>> {
  const checkedInAt = checkedIn ? new Date().toISOString() : null;

  const { error } = await supabaseAdmin
    .from("assignments")
    .update({ checked_in_at: checkedInAt })
    .eq("id", assignmentId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { checkedInAt } };
}

export async function createVolunteer(input: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  association: string;
  shiftPreferences: string[];
  availability: string[];
  shiftCountPreference: string;
}): Promise<ActionResult<{ id: string; magicLinkToken: string }>> {
  const normalizedEmail = input.email.trim();
  // phone_number is a bigint column — it can't hold "" (that's the bug
  // behind "invalid input syntax for type bigint"), so blank becomes null,
  // and we strip spaces/"+" to match the digits-only format already in use
  // for existing volunteers (e.g. "32475641923" for +32 475 64 19 23).
  const digitsOnlyPhone = input.phoneNumber.replace(/[\s+]/g, "").trim();
  const phoneNumber =
    digitsOnlyPhone && /^\d+$/.test(digitsOnlyPhone) ? Number(digitsOnlyPhone) : null;

  const [{ data: emailMatch }, { data: phoneMatch }] = await Promise.all([
    supabaseAdmin.from("volunteers").select("id").ilike("email", normalizedEmail).limit(1),
    phoneNumber !== null
      ? supabaseAdmin.from("volunteers").select("id").eq("phone_number", phoneNumber).limit(1)
      : Promise.resolve({ data: [] as { id: string }[] }),
  ]);

  if ((emailMatch && emailMatch.length > 0) || (phoneMatch && phoneMatch.length > 0)) {
    return {
      ok: false,
      error: "A volunteer with this email or phone number already exists.",
    };
  }

  const id = `manual_${randomUUID().slice(0, 8)}`;
  const magicLinkToken = generateMagicLinkToken();

  const { error } = await supabaseAdmin.from("volunteers").insert({
    id,
    first_name: input.firstName,
    last_name: input.lastName,
    email: normalizedEmail,
    phone_number: phoneNumber,
    association: input.association,
    wants_responsibility: false,
    is_backup: false,
    approval_status: "approved",
    uploaded_video: false,
    magic_link_token: magicLinkToken,
    preferences: input.shiftPreferences.join("; "),
    availability: input.availability.join("; "),
    shift_count_preference: input.shiftCountPreference || null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { id, magicLinkToken } };
}
