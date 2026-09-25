import { supabaseAdmin } from "@/lib/supabase";

export type PlanningAssignment = {
  assignmentId: number;
  volunteerId: string;
  volunteerName: string;
  status: "pending" | "confirmed";
};

export type PlanningShift = {
  id: string;
  date: string;
  day: string;
  slot: string;
  startTime: string;
  endTime: string;
  hours: number;
  location: string;
  roleCategory: string;
  volunteersNeeded: number;
  eventContext: string;
  assignments: PlanningAssignment[];
};

export async function getPlanningShifts(): Promise<PlanningShift[]> {
  const { data: shiftRows } = await supabaseAdmin
    .from("shifts")
    .select(
      "id, date, day, slot, start_time, end_time, hours, location, role_category, volunteers_needed, event_context",
    )
    .order("date")
    .order("start_time");

  const { data: assignmentRows } = await supabaseAdmin
    .from("assignments")
    .select("id, volunteer_id, shift_id, status")
    .in("status", ["pending", "confirmed"]);

  const { data: volunteerRows } = await supabaseAdmin
    .from("volunteers")
    .select("id, first_name, last_name");

  const namesById = new Map(
    (volunteerRows ?? []).map((v) => [
      v.id,
      `${v.first_name} ${v.last_name}`.trim(),
    ]),
  );

  const assignmentsByShift = new Map<string, PlanningAssignment[]>();

  for (const assignment of assignmentRows ?? []) {
    const list = assignmentsByShift.get(assignment.shift_id) ?? [];
    list.push({
      assignmentId: assignment.id,
      volunteerId: assignment.volunteer_id,
      volunteerName:
        namesById.get(assignment.volunteer_id) ?? "Unknown volunteer",
      status: assignment.status,
    });
    assignmentsByShift.set(assignment.shift_id, list);
  }

  return (shiftRows ?? []).map((shift) => ({
    id: shift.id,
    date: shift.date,
    day: shift.day,
    slot: shift.slot,
    startTime: shift.start_time,
    endTime: shift.end_time,
    hours: shift.hours,
    location: shift.location,
    roleCategory: shift.role_category,
    volunteersNeeded: shift.volunteers_needed,
    eventContext: shift.event_context ?? "",
    assignments: assignmentsByShift.get(shift.id) ?? [],
  }));
}

export type ShiftDirectoryEntry = {
  id: string;
  date: string;
  slot: string;
  startTime: string;
  endTime: string;
  location: string;
  roleCategory: string;
};

export async function getShiftDirectory(): Promise<ShiftDirectoryEntry[]> {
  const { data } = await supabaseAdmin
    .from("shifts")
    .select("id, date, slot, start_time, end_time, location, role_category")
    .order("date")
    .order("start_time");

  return (data ?? []).map((shift) => ({
    id: shift.id,
    date: shift.date,
    slot: shift.slot,
    startTime: shift.start_time,
    endTime: shift.end_time,
    location: shift.location,
    roleCategory: shift.role_category,
  }));
}
