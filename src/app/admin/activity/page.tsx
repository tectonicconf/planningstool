import { getAdminTables } from "@/lib/adminData";
import { getRecentAssignmentUpdates, getShiftCoverageStats } from "@/lib/adminActivity";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { ShiftCoverageBar } from "@/components/admin/ShiftCoverageBar";

export default async function AdminActivityPage() {
  const data = await getAdminTables();
  const [updates, coverage] = await Promise.all([
    getRecentAssignmentUpdates(200, data),
    getShiftCoverageStats(data),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Activity</h1>
      <p className="mt-1 text-sm text-slate-500">
        Latest confirmed, pending and cancelled shifts, most recent first.
        Click a row for its volunteer, or the arrow to expand details.
      </p>

      <div className="mt-6">
        <ShiftCoverageBar stats={coverage} />
      </div>

      <div className="mt-6">
        <ActivityFeed updates={updates} />
      </div>
    </div>
  );
}
