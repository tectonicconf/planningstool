import { supabaseAdmin } from "@/lib/supabase";

// Fetches the three tables every admin page needs, in one round trip each,
// so a page that needs more than one derived view (e.g. both the planning
// board and the volunteer list) doesn't query shifts/assignments/volunteers
// twice over.
export type AdminTables = {
  shiftRows: {
    id: string;
    date: string;
    day: string;
    slot: string;
    start_time: string;
    end_time: string;
    hours: number;
    location: string;
    role_category: string;
    volunteers_needed: number;
    event_context: string | null;
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
    magic_link_token: string;
  }[];
};

export async function getAdminTables(): Promise<AdminTables> {
  const [{ data: shiftRows }, { data: assignmentRows }, { data: volunteerRows }] =
    await Promise.all([
      supabaseAdmin
        .from("shifts")
        .select(
          "id, date, day, slot, start_time, end_time, hours, location, role_category, volunteers_needed, event_context",
        )
        .order("date")
        .order("start_time"),
      supabaseAdmin
        .from("assignments")
        .select("id, volunteer_id, shift_id, status, checked_in_at, updated_at"),
      supabaseAdmin
        .from("volunteers")
        .select(
          "id, first_name, last_name, email, phone_number, association, availability, magic_link_token",
        )
        .order("first_name"),
    ]);

  return {
    shiftRows: shiftRows ?? [],
    assignmentRows: assignmentRows ?? [],
    volunteerRows: volunteerRows ?? [],
  };
}
