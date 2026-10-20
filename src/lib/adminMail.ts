import { getAdminTables, type AdminTables } from "@/lib/adminData";

export type MailRecipient = {
  volunteerId: string;
  name: string;
  email: string;
};

export type MailShift = {
  id: string;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  room: string;
  roleCategory: string;
  shiftTitle: string;
  // Only active (pending/confirmed) assignments — a cancelled assignment
  // shouldn't pull that volunteer into a mailing about this shift.
  recipients: MailRecipient[];
};

// The shift-selector side of the mail tab: every shift plus who (if anyone)
// is actively assigned to it, with enough contact info to mail them
// directly. Deliberately its own query shape rather than reusing
// PlanningShift — the mail tab only ever needs id/name/email per assignment,
// not status/checkedInAt.
export async function getMailShifts(data?: AdminTables): Promise<MailShift[]> {
  const { shiftRows, assignmentRows, volunteerRows } = data ?? (await getAdminTables());

  const volunteersById = new Map(
    volunteerRows.map((v) => [
      v.id,
      { name: `${v.first_name} ${v.last_name}`.trim(), email: v.email },
    ]),
  );

  const recipientsByShift = new Map<string, MailRecipient[]>();
  for (const assignment of assignmentRows) {
    if (assignment.status === "cancelled") continue;
    const volunteer = volunteersById.get(assignment.volunteer_id);
    if (!volunteer || !volunteer.email) continue;

    const list = recipientsByShift.get(assignment.shift_id) ?? [];
    list.push({ volunteerId: assignment.volunteer_id, ...volunteer });
    recipientsByShift.set(assignment.shift_id, list);
  }

  return shiftRows.map((shift) => ({
    id: shift.id,
    date: shift.date,
    endDate: shift.end_date,
    startTime: shift.start_time,
    endTime: shift.end_time,
    location: shift.location,
    room: shift.room ?? "",
    roleCategory: shift.role_category,
    shiftTitle: shift.shift ?? "",
    recipients: recipientsByShift.get(shift.id) ?? [],
  }));
}

// The manual-add side: every volunteer with an email on file, regardless of
// whether they're assigned to anything — so an admin can add someone to a
// mailing who isn't (yet) on one of the selected shifts.
export async function getMailVolunteers(data?: AdminTables): Promise<MailRecipient[]> {
  const { volunteerRows } = data ?? (await getAdminTables());

  return volunteerRows
    .filter((v) => v.email)
    .map((v) => ({
      volunteerId: v.id,
      name: `${v.first_name} ${v.last_name}`.trim(),
      email: v.email,
    }));
}
