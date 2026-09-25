import { supabaseAdmin } from "@/lib/supabase";

export type VolunteerAssignmentStatus = "pending" | "confirmed" | "cancelled";

export type VolunteerAssignment = {
  assignmentId: number;
  shiftId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  roleCategory: string;
  status: VolunteerAssignmentStatus;
};

export type VolunteerRow = {
  id: string;
  name: string;
  email: string;
  association: string;
  availability: string[];
  assignments: VolunteerAssignment[];
};

export async function getVolunteersWithAssignments(): Promise<
  VolunteerRow[]
> {
  const { data: volunteerRows } = await supabaseAdmin
    .from("volunteers")
    .select("id, first_name, last_name, email, association, availability")
    .order("first_name");

  const { data: assignmentRows } = await supabaseAdmin
    .from("assignments")
    .select("id, volunteer_id, shift_id, status");

  const { data: shiftRows } = await supabaseAdmin
    .from("shifts")
    .select("id, date, start_time, end_time, location, role_category");

  const shiftsById = new Map((shiftRows ?? []).map((s) => [s.id, s]));

  const assignmentsByVolunteer = new Map<string, VolunteerAssignment[]>();

  for (const assignment of assignmentRows ?? []) {
    const shift = shiftsById.get(assignment.shift_id);
    if (!shift) continue;

    const list = assignmentsByVolunteer.get(assignment.volunteer_id) ?? [];
    list.push({
      assignmentId: assignment.id,
      shiftId: shift.id,
      date: shift.date,
      startTime: shift.start_time,
      endTime: shift.end_time,
      location: shift.location,
      roleCategory: shift.role_category,
      status: assignment.status,
    });
    assignmentsByVolunteer.set(assignment.volunteer_id, list);
  }

  return (volunteerRows ?? []).map((volunteer) => ({
    id: volunteer.id,
    name: `${volunteer.first_name} ${volunteer.last_name}`.trim(),
    email: volunteer.email,
    association: volunteer.association ?? "",
    availability: (volunteer.availability ?? "")
      .split(";")
      .map((entry: string) => entry.trim())
      .filter(Boolean),
    assignments: (assignmentsByVolunteer.get(volunteer.id) ?? []).sort(
      (a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
    ),
  }));
}
