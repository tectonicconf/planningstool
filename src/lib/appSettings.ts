import { supabaseAdmin } from "@/lib/supabase";

// Single global switch (table: app_settings, one row, id = 1) used to freeze
// volunteer-initiated cancellations of an already-confirmed shift — e.g.
// during the live event, when a last-minute cancellation is much harder to
// backfill than it is beforehand. See respondToAssignment/respondToAssignments
// in assignments.ts for where it's enforced, and setCancellationsEnabled in
// adminActions.ts for the admin-side toggle. Declining a still-pending
// invite is never gated by this — only cancelling something already
// confirmed.
export async function getCancellationsEnabled(): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("allow_confirmed_cancellations")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    // Fail open — a missing table or a transient query error shouldn't lock
    // every volunteer out of managing their own shifts. This also means the
    // feature degrades gracefully (cancellations stay allowed, same as
    // before it existed) if the table hasn't been created yet.
    console.error("getCancellationsEnabled: query failed:", error.message);
    return true;
  }

  return data?.allow_confirmed_cancellations ?? true;
}
