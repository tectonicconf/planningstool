import { supabaseAdmin } from "@/lib/supabase";

// Fetches the three tables every admin page needs, in one round trip each,
// so a page that needs more than one derived view (e.g. both the planning
// board and the volunteer list) doesn't query shifts/assignments/volunteers
// twice over.
export type AdminTables = {
  shiftRows: {
    id: string;
    date: string;
    end_date: string;
    day: string;
    slot: string;
    start_time: string;
    end_time: string;
    hours: number;
    location: string;
    role_category: string;
    volunteers_needed: number;
    event_context: string | null;
    shift_lead: string | null;
    tectonic_responsible: string | null;
    shift: string | null;
    room: string | null;
    volunteer: string | null;
    extra_info: string | null;
  }[];
  assignmentRows: {
    id: number;
    volunteer_id: string;
    shift_id: string;
    status: "pending" | "confirmed" | "cancelled";
    checked_in_at: string | null;
    // Separate from checked_in_at — see PlanningAssignment.peopleCheckedIn
    // (adminPlanning.ts) for what distinguishes the two. A plain boolean
    // (unlike checked_in_at's timestamp) — that's the column type as it was
    // actually created, so the UI can't show *when* for this one.
    people_checkin: boolean | null;
    updated_at: string;
  }[];
  volunteerRows: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    // Really a numeric column in Postgres (confirmed on real rows) despite
    // the name/every other phone-ish column being text — Supabase returns a
    // JS `number` for it. Coerced to a real string in
    // getVolunteersWithAssignments (adminVolunteers.ts); don't call string
    // methods on this raw field directly.
    phone_number: string | number | null;
    association: string | null;
    availability: string | null;
    preferences: string | null;
    magic_link_token: string;
    shift_count_preference: string | null;
    quiz: boolean | null;
    size: string | null;
    emergency_first_name: string | null;
    emergency_last_name: string | null;
    emergency_phone: string | null;
    // Mixed-case on purpose — the column was created as `"LinkedIn"`
    // (quoted) rather than the table's usual snake_case, so every query
    // touching it must reference this exact casing.
    LinkedIn: string | null;
    // Per-day, per-volunteer attendance flags — see dailyCheckin.ts for the
    // date each one corresponds to. Set automatically (never directly by an
    // admin) whenever a people-check-in happens for a shift on that day —
    // see setAssignmentPeopleCheckedIn in adminActions.ts.
    daily_checkin_1: boolean | null;
    daily_checkin_2: boolean | null;
  }[];
};

export async function getAdminTables(): Promise<AdminTables> {
  const [
    { data: shiftRows, error: shiftsError },
    { data: assignmentRows, error: assignmentsError },
    { data: volunteerRows, error: volunteersError },
  ] = await Promise.all([
    supabaseAdmin
      .from("shifts")
      .select(
        "id, date, end_date, day, slot, start_time, end_time, hours, location, role_category, volunteers_needed, event_context, shift_lead, tectonic_responsible, shift, room, volunteer, extra_info",
      )
      .order("date")
      .order("start_time"),
    supabaseAdmin
      .from("assignments")
      .select("id, volunteer_id, shift_id, status, checked_in_at, people_checkin, updated_at"),
    supabaseAdmin
      .from("volunteers")
      .select(
        "id, first_name, last_name, email, phone_number, association, availability, preferences, magic_link_token, shift_count_preference, quiz, size, emergency_first_name, emergency_last_name, emergency_phone, LinkedIn, daily_checkin_1, daily_checkin_2",
      )
      .order("first_name"),
  ]);

  // A query error (e.g. a column that doesn't exist yet in this
  // environment) otherwise falls through silently — `?? []` below would mask
  // it as "zero rows" instead of a failed fetch, which previously showed up
  // as every volunteer looking unassigned rather than as a visible error.
  if (shiftsError) console.error("getAdminTables: shifts query failed:", shiftsError.message);
  if (assignmentsError)
    console.error("getAdminTables: assignments query failed:", assignmentsError.message);
  if (volunteersError)
    console.error("getAdminTables: volunteers query failed:", volunteersError.message);

  return {
    shiftRows: shiftRows ?? [],
    assignmentRows: assignmentRows ?? [],
    volunteerRows: volunteerRows ?? [],
  };
}

// Shifts sharing the exact same (non-empty) `shift.volunteer` value were
// split into back-to-back blocks meant to be combined into one "template" —
// see Shift.templateKey in src/lib/shifts.ts for the volunteer-facing side
// of the same idea. Here it's a flat set of shift ids so admin views can
// badge any shift that's part of one, independent of who (if anyone) is
// currently assigned to it.
export function getTemplateShiftIds(shiftRows: AdminTables["shiftRows"]): Set<string> {
  const countByKey = new Map<string, number>();
  for (const shift of shiftRows) {
    if (!shift.volunteer) continue;
    countByKey.set(shift.volunteer, (countByKey.get(shift.volunteer) ?? 0) + 1);
  }

  const ids = new Set<string>();
  for (const shift of shiftRows) {
    if (shift.volunteer && (countByKey.get(shift.volunteer) ?? 0) > 1) {
      ids.add(shift.id);
    }
  }
  return ids;
}
