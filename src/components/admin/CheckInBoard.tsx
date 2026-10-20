"use client";

import { useMemo, useState } from "react";
import type { PlanningShift, PlanningAssignment } from "@/lib/adminPlanning";
import { setAssignmentCheckedIn, setAssignmentPeopleCheckedIn } from "@/lib/adminActions";
import { ROLE_STYLES, DEFAULT_ROLE_STYLE } from "@/lib/constants";

function formatShortDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function roleStyle(role: string) {
  return ROLE_STYLES[role] ?? DEFAULT_ROLE_STYLE;
}

function locationLabel(location: string, room: string) {
  return room ? `${location} · ${room}` : location;
}

function distinctSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

// Nothing left to do for this shift once every confirmed assignment has
// both checks — a shift with no confirmed assignments at all (only pending,
// or none) counts as trivially done too, since there's no one to check in.
function isShiftDone(shift: PlanningShift): boolean {
  const confirmed = shift.assignments.filter((a) => a.status === "confirmed");
  return confirmed.every((a) => a.checkedInAt && a.peopleCheckedIn);
}

function timeGroupKey(shift: PlanningShift): string {
  return `${shift.date}|||${shift.startTime}`;
}

export function CheckInBoard({ initialShifts }: { initialShifts: PlanningShift[] }) {
  const [shifts, setShifts] = useState(initialShifts);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return initialShifts.some((s) => s.date === today) ? today : "all";
  });
  const [hideDone, setHideDone] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const knownDates = useMemo(() => distinctSorted(shifts.map((s) => s.date)), [shifts]);

  const visibleShifts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return shifts
      .filter((s) => s.assignments.length > 0)
      .filter((s) => dateFilter === "all" || s.date === dateFilter)
      .filter((s) => (hideDone ? !isShiftDone(s) : true))
      .filter((s) => {
        if (!q) return true;
        return (
          s.id.toLowerCase().includes(q) ||
          s.shiftTitle.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.room.toLowerCase().includes(q) ||
          s.roleCategory.toLowerCase().includes(q) ||
          s.assignments.some((a) => a.volunteerName.toLowerCase().includes(q))
        );
      });
  }, [shifts, query, dateFilter, hideDone]);

  // Grouped — and sorted — by start time first, not location, so an admin
  // can work straight down the clock: everyone whose shift starts at 09:00,
  // then everyone at 10:00, and so on, regardless of where each shift is.
  const timeGroups = useMemo(() => {
    const byKey = new Map<string, PlanningShift[]>();
    for (const shift of visibleShifts) {
      const key = timeGroupKey(shift);
      const list = byKey.get(key) ?? [];
      list.push(shift);
      byKey.set(key, list);
    }

    return Array.from(byKey.entries())
      .map(([key, groupShifts]) => ({
        key,
        date: groupShifts[0].date,
        startTime: groupShifts[0].startTime,
        shifts: groupShifts.sort(
          (a, b) =>
            a.location.localeCompare(b.location) ||
            a.room.localeCompare(b.room) ||
            a.shiftTitle.localeCompare(b.shiftTitle),
        ),
      }))
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  }, [visibleShifts]);

  async function handleToggleCheckedIn(shift: PlanningShift, assignment: PlanningAssignment) {
    const nextCheckedIn = !assignment.checkedInAt;

    setBusyKey(`checkin-${assignment.assignmentId}`);
    const result = await setAssignmentCheckedIn(assignment.assignmentId, nextCheckedIn);
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setShifts((current) =>
      current.map((s) =>
        s.id === shift.id
          ? {
              ...s,
              assignments: s.assignments.map((a) =>
                a.assignmentId === assignment.assignmentId
                  ? { ...a, checkedInAt: result.data.checkedInAt }
                  : a,
              ),
            }
          : s,
      ),
    );
  }

  async function handleTogglePeopleCheckedIn(shift: PlanningShift, assignment: PlanningAssignment) {
    const nextCheckedIn = !assignment.peopleCheckedIn;

    setBusyKey(`people-${assignment.assignmentId}`);
    const result = await setAssignmentPeopleCheckedIn(assignment.assignmentId, nextCheckedIn);
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setShifts((current) =>
      current.map((s) =>
        s.id === shift.id
          ? {
              ...s,
              assignments: s.assignments.map((a) =>
                a.assignmentId === assignment.assignmentId
                  ? { ...a, peopleCheckedIn: result.data.peopleCheckedIn }
                  : a,
              ),
            }
          : s,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold">Check-in</h1>
      <p className="mt-1 text-slate-500">
        Sorted by start time so you can work straight down the clock. People check-in and shift
        check-in are tracked separately — a row lights up amber when only one of the two is done.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by shift name, location, type or volunteer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-64 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All dates</option>
          {knownDates.map((date) => (
            <option key={date} value={date}>
              {formatShortDate(date)}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={hideDone}
            onChange={(e) => setHideDone(e.target.checked)}
          />
          Hide fully checked in
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {timeGroups.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500">
            Nothing to check in here.
          </p>
        )}

        {timeGroups.map((group) => (
          <div key={group.key}>
            <h2 className="text-sm font-bold text-slate-800">
              {formatShortDate(group.date)} · {group.startTime}
            </h2>

            <div className="mt-2 flex flex-col gap-3">
              {group.shifts.map((shift) => {
                const style = roleStyle(shift.roleCategory);
                const confirmed = shift.assignments.filter((a) => a.status === "confirmed");
                const bothDoneCount = confirmed.filter(
                  (a) => a.checkedInAt && a.peopleCheckedIn,
                ).length;

                return (
                  <div key={shift.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        {shift.shiftTitle || shift.roleCategory}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.badgeClassName}`}
                        >
                          {shift.roleCategory}
                        </span>
                      </p>
                      {confirmed.length > 0 && (
                        <span className="text-xs font-semibold text-slate-500">
                          {bothDoneCount}/{confirmed.length} checked in
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {locationLabel(shift.location, shift.room)} · {shift.startTime}–
                      {shift.endTime}
                    </p>

                    <div className="mt-2 flex flex-col gap-1">
                      {shift.assignments.map((assignment) => {
                        if (assignment.status !== "confirmed") {
                          return (
                            <div
                              key={assignment.assignmentId}
                              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-400"
                            >
                              <span className="truncate">{assignment.volunteerName}</span>
                              <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                                Pending
                              </span>
                            </div>
                          );
                        }

                        const mismatch =
                          Boolean(assignment.checkedInAt) !== assignment.peopleCheckedIn;
                        const busyPeople = busyKey === `people-${assignment.assignmentId}`;
                        const busyCheckin = busyKey === `checkin-${assignment.assignmentId}`;

                        return (
                          <div
                            key={assignment.assignmentId}
                            className={`flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm ${
                              mismatch ? "bg-amber-50" : ""
                            }`}
                          >
                            <span className="truncate font-medium text-slate-800">
                              {assignment.volunteerName}
                            </span>
                            <div className="flex shrink-0 items-center gap-3">
                              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={assignment.peopleCheckedIn}
                                  disabled={busyPeople}
                                  onChange={() => handleTogglePeopleCheckedIn(shift, assignment)}
                                  title={
                                    assignment.peopleCheckedIn
                                      ? "People checked in"
                                      : "Mark as checked in"
                                  }
                                />
                                People
                              </label>
                              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={Boolean(assignment.checkedInAt)}
                                  disabled={busyCheckin}
                                  onChange={() => handleToggleCheckedIn(shift, assignment)}
                                  title={
                                    assignment.checkedInAt
                                      ? `Checked in at ${new Date(assignment.checkedInAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                                      : "Mark as checked in"
                                  }
                                />
                                Check-in
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
