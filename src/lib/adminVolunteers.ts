import { getAdminTables, type AdminTables } from "@/lib/adminData";

export type VolunteerAssignmentStatus = "pending" | "confirmed" | "cancelled";

export type VolunteerAssignment = {
  assignmentId: number;
  shiftId: string;
  date: string;
  endDate: string;
  slot: string;
  startTime: string;
  endTime: string;
  location: string;
  roleCategory: string;
  shiftTitle: string;
  room: string;
  shiftLead: string;
  status: VolunteerAssignmentStatus;
  checkedInAt: string | null;
};

export type VolunteerRow = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  association: string;
  availability: string[];
  shiftPreferences: string[];
  magicLinkToken: string;
  shiftCountPreference: string;
  quizCompleted: boolean;
  shirtSize: string;
  emergencyContactName: string;
  emergencyPhone: string;
  assignments: VolunteerAssignment[];
};

export async function getVolunteersWithAssignments(
  data?: AdminTables,
): Promise<VolunteerRow[]> {
  const { volunteerRows, assignmentRows, shiftRows } = data ?? (await getAdminTables());

  const shiftsById = new Map(shiftRows.map((s) => [s.id, s]));

  const assignmentsByVolunteer = new Map<string, VolunteerAssignment[]>();

  for (const assignment of assignmentRows) {
    const shift = shiftsById.get(assignment.shift_id);
    if (!shift) continue;

    const list = assignmentsByVolunteer.get(assignment.volunteer_id) ?? [];
    list.push({
      assignmentId: assignment.id,
      shiftId: shift.id,
      date: shift.date,
      endDate: shift.end_date,
      slot: shift.slot,
      startTime: shift.start_time,
      endTime: shift.end_time,
      location: shift.location,
      roleCategory: shift.role_category,
      shiftTitle: shift.shift ?? "",
      room: shift.room ?? "",
      shiftLead: shift.shift_lead ?? "",
      status: assignment.status,
      checkedInAt: assignment.checked_in_at,
    });
    assignmentsByVolunteer.set(assignment.volunteer_id, list);
  }

  return volunteerRows.map((volunteer) => ({
    id: volunteer.id,
    name: `${volunteer.first_name} ${volunteer.last_name}`.trim(),
    email: volunteer.email,
    phoneNumber: volunteer.phone_number ?? "",
    association: volunteer.association ?? "",
    availability: (volunteer.availability ?? "")
      .split(";")
      .map((entry: string) => entry.trim())
      .filter(Boolean),
    shiftPreferences: (volunteer.preferences ?? "")
      .split(";")
      .map((entry: string) => entry.trim())
      .filter(Boolean),
    magicLinkToken: volunteer.magic_link_token,
    shiftCountPreference: volunteer.shift_count_preference ?? "",
    quizCompleted: volunteer.quiz ?? false,
    shirtSize: volunteer.size ?? "",
    emergencyContactName: [volunteer.emergency_first_name, volunteer.emergency_last_name]
      .filter(Boolean)
      .join(" "),
    emergencyPhone: volunteer.emergency_phone ?? "",
    assignments: (assignmentsByVolunteer.get(volunteer.id) ?? []).sort(
      (a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
    ),
  }));
}
