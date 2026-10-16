import { getAdminTables, getTemplateShiftIds, type AdminTables } from "@/lib/adminData";

export type PlanningAssignment = {
  assignmentId: number;
  volunteerId: string;
  volunteerName: string;
  status: "pending" | "confirmed";
  checkedInAt: string | null;
};

export type PlanningShift = {
  id: string;
  date: string;
  endDate: string;
  day: string;
  slot: string;
  startTime: string;
  endTime: string;
  hours: number;
  location: string;
  roleCategory: string;
  volunteersNeeded: number;
  eventContext: string;
  shiftLead: string;
  shiftTitle: string;
  room: string;
  // True when this shift shares its `shift.volunteer` grouping key with at
  // least one other shift — see getTemplateShiftIds in adminData.ts.
  isTemplate: boolean;
  // The raw grouping key itself, but only when isTemplate is true — "" for
  // a standalone shift even if its own `shift.volunteer` column happens to
  // hold some unshared value.
  templateKey: string;
  assignments: PlanningAssignment[];
};

export async function getPlanningShifts(
  data?: AdminTables,
): Promise<PlanningShift[]> {
  const { shiftRows, assignmentRows, volunteerRows } = data ?? (await getAdminTables());
  const templateShiftIds = getTemplateShiftIds(shiftRows);

  const namesById = new Map(
    volunteerRows.map((v) => [v.id, `${v.first_name} ${v.last_name}`.trim()]),
  );

  const assignmentsByShift = new Map<string, PlanningAssignment[]>();

  for (const assignment of assignmentRows) {
    if (assignment.status === "cancelled") continue;

    const list = assignmentsByShift.get(assignment.shift_id) ?? [];
    list.push({
      assignmentId: assignment.id,
      volunteerId: assignment.volunteer_id,
      volunteerName:
        namesById.get(assignment.volunteer_id) ?? "Unknown volunteer",
      status: assignment.status,
      checkedInAt: assignment.checked_in_at,
    });
    assignmentsByShift.set(assignment.shift_id, list);
  }

  return shiftRows.map((shift) => ({
    id: shift.id,
    date: shift.date,
    endDate: shift.end_date,
    day: shift.day,
    slot: shift.slot,
    startTime: shift.start_time,
    endTime: shift.end_time,
    hours: shift.hours,
    location: shift.location,
    roleCategory: shift.role_category,
    volunteersNeeded: shift.volunteers_needed,
    eventContext: shift.event_context ?? "",
    shiftLead: shift.shift_lead ?? "",
    shiftTitle: shift.shift ?? "",
    room: shift.room ?? "",
    isTemplate: templateShiftIds.has(shift.id),
    templateKey: templateShiftIds.has(shift.id) ? (shift.volunteer ?? "") : "",
    assignments: assignmentsByShift.get(shift.id) ?? [],
  }));
}

export type TemplateGroup = {
  key: string;
  blocks: PlanningShift[];
};

// All shifts grouped into their templates — the admin-side view of the same
// grouping the volunteer portal does per-volunteer (see ShiftDashboard.tsx's
// `entries`), except here it's every template in the system regardless of
// who (if anyone) is currently assigned to its blocks.
export async function getTemplateGroups(data?: AdminTables): Promise<TemplateGroup[]> {
  const shifts = await getPlanningShifts(data);

  const byKey = new Map<string, PlanningShift[]>();
  for (const shift of shifts) {
    if (!shift.isTemplate) continue;
    const list = byKey.get(shift.templateKey) ?? [];
    list.push(shift);
    byKey.set(shift.templateKey, list);
  }

  return Array.from(byKey.entries())
    .map(([key, blocks]) => ({
      key,
      blocks: blocks.sort(
        (a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
      ),
    }))
    .sort((a, b) =>
      `${a.blocks[0].date}${a.blocks[0].startTime}`.localeCompare(
        `${b.blocks[0].date}${b.blocks[0].startTime}`,
      ),
    );
}

export type ShiftDirectoryEntry = {
  id: string;
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
  isTemplate: boolean;
};

export async function getShiftDirectory(
  data?: AdminTables,
): Promise<ShiftDirectoryEntry[]> {
  const { shiftRows } = data ?? (await getAdminTables());
  const templateShiftIds = getTemplateShiftIds(shiftRows);

  return shiftRows.map((shift) => ({
    id: shift.id,
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
    isTemplate: templateShiftIds.has(shift.id),
  }));
}
