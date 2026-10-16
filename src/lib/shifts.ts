import { supabaseAdmin } from "@/lib/supabase";

export type ShiftStatus = "pending" | "confirmed";

export type ShiftCrewMember = {
  name: string;
  status: ShiftStatus;
  isSelf: boolean;
};

export type Shift = {
  assignmentId: number;
  shiftId: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  location: string;
  room: string;
  shiftType: string;
  shiftTitle: string;
  shiftLead: string;
  extraInfo: string;
  status: ShiftStatus;
  crew: ShiftCrewMember[];
};

export async function getShiftsForVolunteer(
  volunteerId: string,
): Promise<Shift[]> {
  const { data: assignments, error: assignmentsError } = await supabaseAdmin
    .from("assignments")
    .select("id, shift_id, status")
    .eq("volunteer_id", volunteerId)
    .in("status", ["pending", "confirmed"]);

  if (assignmentsError || !assignments || assignments.length === 0) {
    return [];
  }

  const shiftIds = assignments.map((assignment) => assignment.shift_id);

  const { data: shiftRows, error: shiftsError } = await supabaseAdmin
    .from("shifts")
    .select(
      "id, date, start_time, end_time, hours, location, role_category, room, shift, shift_lead, extra_info",
    )
    .in("id", shiftIds);

  if (shiftsError || !shiftRows) {
    return [];
  }

  // Crew lists need every OTHER volunteer assigned to these same shifts, not
  // just this one — a separate pair of queries (all active assignments on
  // these shifts, then the volunteer names behind them) rather than a join,
  // since supabase-js keeps that simpler to type and cache.
  const { data: crewAssignments } = await supabaseAdmin
    .from("assignments")
    .select("shift_id, volunteer_id, status")
    .in("shift_id", shiftIds)
    .in("status", ["pending", "confirmed"]);

  const crewVolunteerIds = Array.from(
    new Set((crewAssignments ?? []).map((a) => a.volunteer_id)),
  );

  const { data: crewVolunteers } = crewVolunteerIds.length
    ? await supabaseAdmin
        .from("volunteers")
        .select("id, first_name, last_name")
        .in("id", crewVolunteerIds)
    : { data: [] as { id: string; first_name: string; last_name: string }[] };

  const crewNamesById = new Map(
    (crewVolunteers ?? []).map((v) => [v.id, `${v.first_name} ${v.last_name}`.trim()]),
  );

  const crewByShiftId = new Map<string, ShiftCrewMember[]>();
  for (const assignment of crewAssignments ?? []) {
    const list = crewByShiftId.get(assignment.shift_id) ?? [];
    list.push({
      name: crewNamesById.get(assignment.volunteer_id) ?? "Volunteer",
      status: assignment.status as ShiftStatus,
      isSelf: assignment.volunteer_id === volunteerId,
    });
    crewByShiftId.set(assignment.shift_id, list);
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
        shiftId: shift.id,
        date: shift.date,
        startTime: shift.start_time,
        endTime: shift.end_time,
        hours: shift.hours,
        location: shift.location,
        room: shift.room ?? "",
        shiftType: shift.role_category,
        shiftTitle: shift.shift ?? "",
        shiftLead: shift.shift_lead ?? "",
        extraInfo: shift.extra_info ?? "",
        status: assignment.status as ShiftStatus,
        crew: crewByShiftId.get(shift.id) ?? [],
      };
    })
    .filter((shift): shift is Shift => shift !== null)
    .sort((a, b) =>
      `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
    );
}
