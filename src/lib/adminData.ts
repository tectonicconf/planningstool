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
    shift: string | null;
    room: string | null;
    volunteer: string | null;
  }[];
  assignmentRows: {
    id: number;
    volunteer_id: string;
    shift_id: string;
    status: "pending" | "confirmed" | "cancelled";
    checked_in_at: string | null;
    updated_at: string;
  }[];
  volunteerRows: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
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
  }[];
};

export async function getAdminTables(): Promise<AdminTables> {
  const [{ data: shiftRows }, { data: assignmentRows }, { data: volunteerRows }] =
    await Promise.all([
      supabaseAdmin
        .from("shifts")
        .select(
          "id, date, end_date, day, slot, start_time, end_time, hours, location, role_category, volunteers_needed, event_context, shift_lead, shift, room, volunteer",
        )
        .order("date")
        .order("start_time"),
      supabaseAdmin
        .from("assignments")
        .select("id, volunteer_id, shift_id, status, checked_in_at, updated_at"),
      supabaseAdmin
        .from("volunteers")
        .select(
          "id, first_name, last_name, email, phone_number, association, availability, preferences, magic_link_token, shift_count_preference, quiz, size, emergency_first_name, emergency_last_name, emergency_phone",
        )
        .order("first_name"),
    ]);

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
