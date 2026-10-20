import { getAdminTables } from "@/lib/adminData";
import {
  getRecentAssignmentUpdates,
  getShiftCoverageByDay,
  getQuizCompletionStats,
  getTshirtSizeStats,
  getUnassignedVolunteers,
  getVolunteerShiftCountLists,
} from "@/lib/adminActivity";
import { DailyActivity } from "@/components/admin/DailyActivity";
import { QuizCompletionBar } from "@/components/admin/QuizCompletionBar";
import { TshirtSizeBar } from "@/components/admin/TshirtSizeBar";
import { UnassignedVolunteers } from "@/components/admin/UnassignedVolunteers";
import { VolunteerShiftCountList } from "@/components/admin/VolunteerShiftCountList";

export default async function AdminActivityPage() {
  const data = await getAdminTables();
  const [updates, dailyCoverage, quizStats, tshirtStats, unassignedVolunteers, shiftCountLists] =
    await Promise.all([
      getRecentAssignmentUpdates(1000, data),
      getShiftCoverageByDay(data),
      getQuizCompletionStats(data),
      getTshirtSizeStats(data),
      getUnassignedVolunteers(data),
      getVolunteerShiftCountLists(data),
    ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Activity</h1>
      <p className="mt-1 text-sm text-slate-500">
        Latest confirmed, pending and cancelled shifts, most recent first.
        Click a row for its volunteer, or the arrow to expand details. Click a day below to see
        just that day&apos;s numbers.
      </p>

      <div className="mt-6">
        <DailyActivity dailyCoverage={dailyCoverage} updates={updates} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <QuizCompletionBar stats={quizStats} />
        <TshirtSizeBar stats={tshirtStats} />
      </div>

      <div className="mt-6">
        <UnassignedVolunteers volunteers={unassignedVolunteers} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <VolunteerShiftCountList
          title="Tectonic"
          volunteers={shiftCountLists.oneShift}
          emptyMessage="No one has a shift yet."
        />
        <VolunteerShiftCountList
          title="Tecnotonic"
          volunteers={shiftCountLists.twoShiftsOrLate}
          emptyMessage="No one matches this right now."
        />
      </div>
    </div>
  );
}
