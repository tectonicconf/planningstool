import { getAdminTables, type AdminTables } from "@/lib/adminData";
import { getPlanningShifts } from "@/lib/adminPlanning";
import { SHIRT_SIZES } from "@/lib/constants";

export type AssignmentUpdate = {
  assignmentId: number;
  volunteerId: string;
  volunteerName: string;
  volunteerPhone: string;
  updatedAt: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  roleCategory: string;
};

export type RecentAssignmentUpdates = {
  confirmed: AssignmentUpdate[];
  pending: AssignmentUpdate[];
  cancelled: AssignmentUpdate[];
};

export type ShiftCoverageStats = {
  totalNeeded: number;
  confirmed: number;
  pending: number;
  open: number;
};

export type QuizCompletionStats = {
  total: number;
  completed: number;
  notCompleted: number;
};

export type TshirtSizeStats = {
  total: number;
  sizes: { size: string; count: number }[];
};

export type UnassignedVolunteer = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

// Event-wide staffing snapshot across every shift (not just one day), used
// for the coverage bar at the top of the Activity page. Cancelled
// assignments don't occupy a position (see README's capacity rules), so
// "open" is whatever's left after pending + confirmed.
//
// Broken down per shift date (rather than one event-wide total) so the
// Activity page can let an admin click a day and see just that day's
// numbers — DailyActivity.tsx sums every entry together for the "All days"
// view, so there's no separate all-shifts variant of this function.
export type DailyShiftCoverage = ShiftCoverageStats & { date: string };

export async function getShiftCoverageByDay(data?: AdminTables): Promise<DailyShiftCoverage[]> {
  const { shiftRows, assignmentRows } = data ?? (await getAdminTables());

  const confirmedByShift = new Map<string, number>();
  const pendingByShift = new Map<string, number>();
  for (const a of assignmentRows) {
    if (a.status === "confirmed") {
      confirmedByShift.set(a.shift_id, (confirmedByShift.get(a.shift_id) ?? 0) + 1);
    } else if (a.status === "pending") {
      pendingByShift.set(a.shift_id, (pendingByShift.get(a.shift_id) ?? 0) + 1);
    }
  }

  const byDate = new Map<string, { totalNeeded: number; confirmed: number; pending: number }>();
  for (const shift of shiftRows) {
    const entry = byDate.get(shift.date) ?? { totalNeeded: 0, confirmed: 0, pending: 0 };
    entry.totalNeeded += shift.volunteers_needed;
    entry.confirmed += confirmedByShift.get(shift.id) ?? 0;
    entry.pending += pendingByShift.get(shift.id) ?? 0;
    byDate.set(shift.date, entry);
  }

  return Array.from(byDate.entries())
    .map(([date, totals]) => ({
      date,
      ...totals,
      open: Math.max(0, totals.totalNeeded - totals.confirmed - totals.pending),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Same idea as the coverage bar above, but for onboarding-quiz completion
// across every volunteer, not just ones with a shift.
export async function getQuizCompletionStats(
  data?: AdminTables,
): Promise<QuizCompletionStats> {
  const { volunteerRows } = data ?? (await getAdminTables());

  const total = volunteerRows.length;
  const completed = volunteerRows.filter((v) => v.quiz).length;

  return { total, completed, notCompleted: total - completed };
}

// T-shirt size distribution across every volunteer, in a fixed size order
// (constants.ts) so the bar's segments and legend line up the same way run
// to run — an empty/unset size is grouped as "Not specified".
export async function getTshirtSizeStats(data?: AdminTables): Promise<TshirtSizeStats> {
  const { volunteerRows } = data ?? (await getAdminTables());

  const counts = new Map<string, number>();
  for (const volunteer of volunteerRows) {
    const size = volunteer.size || "Not specified";
    counts.set(size, (counts.get(size) ?? 0) + 1);
  }

  const orderedSizes = SHIRT_SIZES.filter((size) => counts.has(size));
  const otherSizes = Array.from(counts.keys())
    .filter((size) => !SHIRT_SIZES.includes(size as (typeof SHIRT_SIZES)[number]) && size !== "Not specified")
    .sort();

  const sizes = [...orderedSizes, ...otherSizes, ...(counts.has("Not specified") ? ["Not specified"] : [])].map(
    (size) => ({ size, count: counts.get(size) ?? 0 }),
  );

  return { total: volunteerRows.length, sizes };
}

// Volunteers with no active (pending/confirmed) assignment at all — distinct
// from the coverage bar's "open" count above, which counts unfilled shift
// slots rather than un-slotted people. A volunteer whose only assignment was
// cancelled still counts as unassigned.
export async function getUnassignedVolunteers(
  data?: AdminTables,
): Promise<UnassignedVolunteer[]> {
  const { volunteerRows, assignmentRows } = data ?? (await getAdminTables());

  const assignedVolunteerIds = new Set(
    assignmentRows
      .filter((a) => a.status === "pending" || a.status === "confirmed")
      .map((a) => a.volunteer_id),
  );

  return volunteerRows
    .filter((v) => !assignedVolunteerIds.has(v.id))
    .map((v) => ({
      id: v.id,
      name: `${v.first_name} ${v.last_name}`.trim(),
      // phone_number is really numeric in Postgres — see adminData.ts.
      phone: v.phone_number != null ? String(v.phone_number) : "",
      email: v.email,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type VolunteerShiftSummary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  // Counts a whole template as one shift, not one per block (see
  // PlanningShift.templateKey in adminPlanning.ts) — a volunteer covering
  // every block of one template has shiftCount 1, same as someone with a
  // single standalone shift.
  shiftCount: number;
  hasLateShift: boolean;
};

export type VolunteerShiftCountLists = {
  // One or more shifts (by the template-aware count above) — i.e. anyone
  // with an active assignment at all.
  oneShift: VolunteerShiftSummary[];
  // Two or more shifts, OR any shift (any block, template or not) still
  // running at or past the Wednesday cutoff below — the two conditions are
  // independent, so someone with only one (late) shift appears here even
  // though they're also in oneShift.
  twoShiftsOrLate: VolunteerShiftSummary[];
};

const WEDNESDAY_LATE_CUTOFF = "18:31";

function weekdayOf(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" });
}

// "Still busy at 18:31 or later on Wednesday" — a shift counts if it starts
// on a Wednesday and either runs past midnight (so it's still going well
// beyond 18:31 that night) or its own end time on that same day is at or
// after the cutoff. Computed from the weekday name rather than a hardcoded
// date so this keeps working for next year's dates (see the Timeline tab's
// automatic row-packing for the same reasoning).
function isBusyPastWednesdayCutoff(shift: { date: string; endDate: string; endTime: string }): boolean {
  if (weekdayOf(shift.date) !== "Wednesday") return false;
  if (shift.endDate !== shift.date) return true;
  return shift.endTime >= WEDNESDAY_LATE_CUTOFF;
}

// Groups each volunteer's *confirmed* assignments into "shift units" — one
// unit per template they're part of, one per standalone shift otherwise —
// to build the two Activity-tab lists described above. Deliberately
// confirmed-only, not pending too: a still-pending invite might never be
// accepted, so counting it here would overstate how many shifts someone is
// actually doing (getPlanningShifts itself keeps both; the confirmed filter
// is applied here).
export async function getVolunteerShiftCountLists(
  data?: AdminTables,
): Promise<VolunteerShiftCountLists> {
  const tables = data ?? (await getAdminTables());
  const shifts = await getPlanningShifts(tables);

  const unitKeysByVolunteer = new Map<string, Set<string>>();
  const hasLateShiftByVolunteer = new Set<string>();

  for (const shift of shifts) {
    const unitKey = shift.isTemplate ? `template:${shift.templateKey}` : `shift:${shift.id}`;
    const isLate = isBusyPastWednesdayCutoff(shift);

    for (const assignment of shift.assignments) {
      if (assignment.status !== "confirmed") continue;

      const keys = unitKeysByVolunteer.get(assignment.volunteerId) ?? new Set<string>();
      keys.add(unitKey);
      unitKeysByVolunteer.set(assignment.volunteerId, keys);

      if (isLate) {
        hasLateShiftByVolunteer.add(assignment.volunteerId);
      }
    }
  }

  const summaries: VolunteerShiftSummary[] = tables.volunteerRows
    .map((v): VolunteerShiftSummary => ({
      id: v.id,
      // first_name/last_name/email are typed as non-null, but (like `quiz` —
      // see CLAUDE.md) some rows read back null in practice, so coerce
      // defensively instead of trusting the column type.
      name: `${v.first_name ?? ""} ${v.last_name ?? ""}`.trim(),
      email: v.email ?? "",
      // phone_number is really numeric in Postgres — see adminData.ts.
      phone: v.phone_number != null ? String(v.phone_number) : "",
      shiftCount: unitKeysByVolunteer.get(v.id)?.size ?? 0,
      hasLateShift: hasLateShiftByVolunteer.has(v.id),
    }))
    .filter((v) => v.shiftCount > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    oneShift: summaries.filter((v) => v.shiftCount >= 1),
    twoShiftsOrLate: summaries.filter((v) => v.shiftCount >= 2 || v.hasLateShift),
  };
}

// A lightweight activity feed built from the assignments' own current state
// (status + updated_at) rather than a separate audit-log table — it shows
// the latest status per assignment, not a full history of every change.
// Each status is limited independently (after sorting) so a recent wave of
// one doesn't crowd the others out of a shared limit. The UI only shows the
// first 10 of each per default (with a "Load all" button) — this `limit` is
// just a server-side ceiling, kept generous since the whole table is small.
// Confirmed alone passed 200 real rows partway through the event, which was
// silently dropping the oldest ones — bumped well above the event's total
// capacity (331 spots) so a day-filtered count (DailyActivity.tsx) is never
// quietly short of the real per-day total shown in the coverage bar.
export async function getRecentAssignmentUpdates(
  limit = 1000,
  data?: AdminTables,
): Promise<RecentAssignmentUpdates> {
  const { assignmentRows, volunteerRows, shiftRows } = data ?? (await getAdminTables());

  const volunteersById = new Map(volunteerRows.map((v) => [v.id, v]));
  const shiftsById = new Map(shiftRows.map((s) => [s.id, s]));

  function toUpdates(
    status: "confirmed" | "pending" | "cancelled",
  ): AssignmentUpdate[] {
    return assignmentRows
      .filter((assignment) => assignment.status === status)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, limit)
      .flatMap((assignment): AssignmentUpdate[] => {
        const shift = shiftsById.get(assignment.shift_id);
        const volunteer = volunteersById.get(assignment.volunteer_id);
        if (!shift) return [];

        return [
          {
            assignmentId: assignment.id,
            volunteerId: assignment.volunteer_id,
            volunteerName: volunteer
              ? `${volunteer.first_name} ${volunteer.last_name}`.trim()
              : "Unknown volunteer",
            // phone_number is really numeric in Postgres — see adminData.ts.
            volunteerPhone: volunteer?.phone_number != null ? String(volunteer.phone_number) : "",
            updatedAt: assignment.updated_at,
            date: shift.date,
            startTime: shift.start_time,
            endTime: shift.end_time,
            location: shift.location,
            roleCategory: shift.role_category,
          },
        ];
      });
  }

  return {
    confirmed: toUpdates("confirmed"),
    pending: toUpdates("pending"),
    cancelled: toUpdates("cancelled"),
  };
}
