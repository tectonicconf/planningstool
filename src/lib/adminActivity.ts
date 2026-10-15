import { getAdminTables, type AdminTables } from "@/lib/adminData";
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

// Event-wide staffing snapshot across every shift (not just one day), used
// for the coverage bar at the top of the Activity page. Cancelled
// assignments don't occupy a position (see README's capacity rules), so
// "open" is whatever's left after pending + confirmed.
export async function getShiftCoverageStats(
  data?: AdminTables,
): Promise<ShiftCoverageStats> {
  const { shiftRows, assignmentRows } = data ?? (await getAdminTables());

  const totalNeeded = shiftRows.reduce((sum, s) => sum + s.volunteers_needed, 0);
  const confirmed = assignmentRows.filter((a) => a.status === "confirmed").length;
  const pending = assignmentRows.filter((a) => a.status === "pending").length;
  const open = Math.max(0, totalNeeded - confirmed - pending);

  return { totalNeeded, confirmed, pending, open };
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

// A lightweight activity feed built from the assignments' own current state
// (status + updated_at) rather than a separate audit-log table — it shows
// the latest status per assignment, not a full history of every change.
// Each status is limited independently (after sorting) so a recent wave of
// one doesn't crowd the others out of a shared limit. The UI only shows the
// first 10 of each per default (with a "Load all" button) — this `limit` is
// just a server-side ceiling, kept generous since the whole table is small.
export async function getRecentAssignmentUpdates(
  limit = 200,
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
            volunteerPhone: volunteer?.phone_number ?? "",
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
