"use client";

import { useMemo, useState } from "react";
import type { DailyShiftCoverage, RecentAssignmentUpdates, ShiftCoverageStats } from "@/lib/adminActivity";
import { ShiftCoverageBar } from "@/components/admin/ShiftCoverageBar";
import { ActivityFeed } from "@/components/admin/ActivityFeed";

function formatShortDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function sumCoverage(days: DailyShiftCoverage[]): ShiftCoverageStats {
  return days.reduce(
    (totals, day) => ({
      totalNeeded: totals.totalNeeded + day.totalNeeded,
      confirmed: totals.confirmed + day.confirmed,
      pending: totals.pending + day.pending,
      open: totals.open + day.open,
    }),
    { totalNeeded: 0, confirmed: 0, pending: 0, open: 0 },
  );
}

// Clicking a day filters both the coverage bar above and the
// confirmed/pending/cancelled feed below to just that day's shifts — "All
// days" (the default) shows the event-wide totals, same as before this
// filter existed.
export function DailyActivity({
  dailyCoverage,
  updates,
}: {
  dailyCoverage: DailyShiftCoverage[];
  updates: RecentAssignmentUpdates;
}) {
  const [selectedDate, setSelectedDate] = useState<string | "all">("all");

  const stats = useMemo(() => {
    if (selectedDate === "all") return sumCoverage(dailyCoverage);
    return (
      dailyCoverage.find((d) => d.date === selectedDate) ?? {
        date: selectedDate,
        totalNeeded: 0,
        confirmed: 0,
        pending: 0,
        open: 0,
      }
    );
  }, [dailyCoverage, selectedDate]);

  const filteredUpdates = useMemo((): RecentAssignmentUpdates => {
    if (selectedDate === "all") return updates;
    return {
      confirmed: updates.confirmed.filter((u) => u.date === selectedDate),
      pending: updates.pending.filter((u) => u.date === selectedDate),
      cancelled: updates.cancelled.filter((u) => u.date === selectedDate),
    };
  }, [updates, selectedDate]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedDate("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedDate === "all"
              ? "bg-indigo-100 text-indigo-700"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          All days
        </button>
        {dailyCoverage.map((day) => (
          <button
            key={day.date}
            type="button"
            onClick={() => setSelectedDate(day.date)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedDate === day.date
                ? "bg-indigo-100 text-indigo-700"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {formatShortDate(day.date)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <ShiftCoverageBar stats={stats} />
      </div>

      <div className="mt-6">
        <ActivityFeed updates={filteredUpdates} />
      </div>
    </div>
  );
}
