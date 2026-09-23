import { supabaseAdmin } from "@/lib/supabase";

export type ShiftStatus = "pending" | "confirmed";

export type Shift = {
  assignmentId: number;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  location: string;
  shiftType: string;
  status: ShiftStatus;
};

export async function getShiftsForToken(token: string): Promise<Shift[]> {
  const { data: volunteer, error: volunteerError } = await supabaseAdmin
    .from("volunteers")
    .select("id")
    .eq("magic_link_token", token)
    .maybeSingle();

  if (volunteerError || !volunteer) {
    return [];
  }

  const { data: assignments, error: assignmentsError } = await supabaseAdmin
    .from("assignments")
    .select("id, shift_id, status")
    .eq("volunteer_id", volunteer.id)
    .in("status", ["pending", "confirmed"]);

  if (assignmentsError || !assignments || assignments.length === 0) {
    return [];
  }

  const shiftIds = assignments.map((assignment) => assignment.shift_id);

  const { data: shiftRows, error: shiftsError } = await supabaseAdmin
    .from("shifts")
    .select("id, date, start_time, end_time, hours, location, role_category")
    .in("id", shiftIds);

  if (shiftsError || !shiftRows) {
    return [];
  }

  const shiftsById = new Map(shiftRows.map((shift) => [shift.id, shift]));

  return assignments
    .map((assignment): Shift | null => {
      const shift = shiftsById.get(assignment.shift_id);

      if (!shift) {
        return null;
      }

      return {
        assignmentId: assignment.id,
        date: shift.date,
        startTime: shift.start_time,
        endTime: shift.end_time,
        hours: shift.hours,
        location: shift.location,
        shiftType: shift.role_category,
        status: assignment.status as ShiftStatus,
      };
    })
    .filter((shift): shift is Shift => shift !== null)
    .sort((a, b) =>
      `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
    );
}
