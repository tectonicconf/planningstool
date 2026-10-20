import { getAdminTables, getTemplateShiftIds, type AdminTables } from "@/lib/adminData";

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
  tectonicResponsible: string;
  isTemplate: boolean;
  // "" unless isTemplate — see PlanningShift.templateKey in adminPlanning.ts
  // for the same convention.
  templateKey: string;
  status: VolunteerAssignmentStatus;
  checkedInAt: string | null;
};

export type VolunteerRow = {
  id: string;
  // `name` is the derived display string below; firstName/lastName are kept
  // separately too so an edit form can populate two inputs without having to
  // guess how to split a multi-word last name back out of `name`.
  firstName: string;
  lastName: string;
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
  linkedin: string;
  assignments: VolunteerAssignment[];
};

export async function getVolunteersWithAssignments(
  data?: AdminTables,
): Promise<VolunteerRow[]> {
  const { volunteerRows, assignmentRows, shiftRows } = data ?? (await getAdminTables());

  const shiftsById = new Map(shiftRows.map((s) => [s.id, s]));
  const templateShiftIds = getTemplateShiftIds(shiftRows);

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
      tectonicResponsible: shift.tectonic_responsible ?? "",
      isTemplate: templateShiftIds.has(shift.id),
      templateKey: templateShiftIds.has(shift.id) ? (shift.volunteer ?? "") : "",
      status: assignment.status,
      checkedInAt: assignment.checked_in_at,
    });
    assignmentsByVolunteer.set(assignment.volunteer_id, list);
  }

  return volunteerRows.map((volunteer) => ({
    id: volunteer.id,
    firstName: volunteer.first_name ?? "",
    lastName: volunteer.last_name ?? "",
    name: `${volunteer.first_name ?? ""} ${volunteer.last_name ?? ""}`.trim(),
    email: volunteer.email,
    // `phone_number` is typed as a string here, but the underlying Postgres
    // column is actually numeric — Supabase hands back a real JS `number`
    // for it (confirmed on real rows), not a string. Any ``.trim()``/
    // ``.replace()`` call downstream would throw on an uncoerced value, so
    // it's normalized to a string here rather than trusting the column type.
    phoneNumber: volunteer.phone_number != null ? String(volunteer.phone_number) : "",
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
    linkedin: volunteer.LinkedIn ?? "",
    assignments: (assignmentsByVolunteer.get(volunteer.id) ?? []).sort(
      (a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
    ),
  }));
}
