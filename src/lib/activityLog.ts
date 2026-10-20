import { supabaseAdmin } from "@/lib/supabase";

export type ActivityEventType =
  | "shift_assigned"
  | "confirmed"
  | "declined"
  | "cancelled"
  | "removed"
  | "checked_in"
  | "checked_out"
  | "people_checked_in"
  | "people_checked_out"
  | "quiz_completed";

export type ActivityActorType = "volunteer" | "admin";

// Append-only audit trail (table: activity_log) — separate from
// `assignments`/`volunteers`, which only ever hold current state, not
// history. Logging a write failure never blocks the real action it's
// describing, same "best effort, never throws" pattern as the confirmation
// emails in assignments.ts — if `activity_log` doesn't exist yet in a given
// environment, every call here just logs a console error and moves on.
export async function logActivity(entry: {
  eventType: ActivityEventType;
  actorType: ActivityActorType;
  volunteerId: string;
  shiftId?: string | null;
  assignmentId?: number | null;
  note?: string | null;
}): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from("activity_log").insert({
      event_type: entry.eventType,
      actor_type: entry.actorType,
      volunteer_id: entry.volunteerId,
      shift_id: entry.shiftId ?? null,
      assignment_id: entry.assignmentId ?? null,
      note: entry.note ?? null,
      occurred_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to write activity_log entry:", error.message);
    }
  } catch (error) {
    console.error("Failed to write activity_log entry:", error);
  }
}
