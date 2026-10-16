"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { PlanningShift, PlanningAssignment } from "@/lib/adminPlanning";
import type { VolunteerRow } from "@/lib/adminVolunteers";
import {
  addVolunteerToShift,
  removeAssignment,
  setAssignmentCheckedIn,
} from "@/lib/adminActions";
import {
  isVolunteerAvailableForShift,
  hasOverlap,
  hasReachedShiftPreference,
  getDisplayDate,
} from "@/lib/shiftEligibility";
import { Modal } from "@/components/Modal";
import { ROLE_CATEGORIES, ROLE_STYLES, DEFAULT_ROLE_STYLE } from "@/lib/constants";

function formatShortDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLongDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function roleStyle(role: string) {
  return ROLE_STYLES[role] ?? DEFAULT_ROLE_STYLE;
}

const MOBILE_QUERY = "(max-width: 639px)";

function subscribeToMobileQuery(callback: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getIsMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getIsMobileServerSnapshot() {
  return false;
}

const ASSIGNMENT_STATUS_STYLES: Record<"pending" | "confirmed", string> = {
  pending: "bg-blue-100 text-blue-700",
  confirmed: "bg-emerald-100 text-emerald-700",
};

// Minutes between local midnight of `dayDate` and `date`+`time` — can exceed
// 1440 when `date` is a later calendar day, which is exactly what a shift
// that runs past midnight needs (its end lands at, say, 1560 rather than
// wrapping back around to "02:00").
function minutesFromDayStart(dayDate: string, date: string, time: string): number {
  const dayStart = new Date(`${dayDate}T00:00:00`).getTime();
  const point = new Date(`${date}T${time}`).getTime();
  return (point - dayStart) / 60000;
}

export function TimelineBoard({
  initialShifts,
  volunteers: initialVolunteers,
}: {
  initialShifts: PlanningShift[];
  volunteers: VolunteerRow[];
}) {
  const [shifts, setShifts] = useState(initialShifts);
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [expandedShiftId, setExpandedShiftId] = useState<string | null>(null);
  const [addVolunteerShiftId, setAddVolunteerShiftId] = useState<string | null>(null);
  const [addVolunteerQuery, setAddVolunteerQuery] = useState("");
  const [addVolunteerOverride, setAddVolunteerOverride] = useState(false);

  // Hours need to be noticeably narrower on a phone — the desktop width
  // makes every shift's bar look oversized relative to a small viewport,
  // not just slow to scroll through. `useSyncExternalStore` (not a
  // state+effect) so the server snapshot (false) and the one-time client
  // read can't disagree and cause a hydration mismatch.
  const isMobile = useSyncExternalStore(
    subscribeToMobileQuery,
    getIsMobileSnapshot,
    getIsMobileServerSnapshot,
  );

  const dates = useMemo(
    () => Array.from(new Set(shifts.map((s) => getDisplayDate(s.date, s.startTime)))).sort(),
    [shifts],
  );

  const [selectedDate, setSelectedDate] = useState(dates[0] ?? "");
  const activeDate = dates.includes(selectedDate) ? selectedDate : dates[0] ?? "";

  const shiftLeads = useMemo(
    () => Array.from(new Set(shifts.map((s) => s.shiftLead).filter(Boolean))).sort(),
    [shifts],
  );

  const [roleFilter, setRoleFilter] = useState("all");
  const [shiftLeadFilter, setShiftLeadFilter] = useState("all");

  function clearFilters() {
    setRoleFilter("all");
    setShiftLeadFilter("all");
  }

  const shiftsForDate = useMemo(
    () => shifts.filter((s) => getDisplayDate(s.date, s.startTime) === activeDate),
    [shifts, activeDate],
  );

  const filteredShifts = useMemo(() => {
    return shiftsForDate
      .filter((shift) => {
        if (roleFilter !== "all" && shift.roleCategory !== roleFilter) return false;
        if (shiftLeadFilter !== "all" && shift.shiftLead !== shiftLeadFilter) return false;
        return true;
      })
      .sort(
        (a, b) =>
          a.startTime.localeCompare(b.startTime) || a.location.localeCompare(b.location),
      );
  }, [shiftsForDate, roleFilter, shiftLeadFilter]);

  const legendCategories = useMemo(
    () => Array.from(new Set(shiftsForDate.map((s) => s.roleCategory))).sort(),
    [shiftsForDate],
  );

  // The hour grid spans exactly what's on screen for this date — from the
  // earliest shift start to the latest shift end (which can run past
  // midnight), rounded out to whole hours, rather than a fixed 0-24 range
  // that would waste most of the width on hours nothing happens in.
  const { gridStartHour, gridEndHour } = useMemo(() => {
    if (filteredShifts.length === 0) return { gridStartHour: 6, gridEndHour: 22 };

    let minMinutes = Infinity;
    let maxMinutes = -Infinity;

    for (const shift of filteredShifts) {
      const start = minutesFromDayStart(activeDate, shift.date, shift.startTime);
      const end = minutesFromDayStart(activeDate, shift.endDate, shift.endTime);
      minMinutes = Math.min(minMinutes, start);
      maxMinutes = Math.max(maxMinutes, end);
    }

    return {
      gridStartHour: Math.floor(minMinutes / 60),
      gridEndHour: Math.ceil(maxMinutes / 60),
    };
  }, [filteredShifts, activeDate]);

  const totalHours = Math.max(1, gridEndHour - gridStartHour);
  const hourMarks = Array.from({ length: totalHours + 1 }, (_, i) => gridStartHour + i);

  function percentFor(minutes: number) {
    return ((minutes - gridStartHour * 60) / (totalHours * 60)) * 100;
  }

  // pending + confirmed
  const hourlyHeadcount = useMemo(() => {
    const counts: { hour: number; total: number }[] = [];

    for (let hour = gridStartHour; hour < gridEndHour; hour++) {
      const bucketStart = hour * 60;
      const bucketEnd = bucketStart + 60;
      let total = 0;

      for (const shift of filteredShifts) {
        const start = minutesFromDayStart(activeDate, shift.date, shift.startTime);
        const end = minutesFromDayStart(activeDate, shift.endDate, shift.endTime);
        if (start < bucketEnd && bucketStart < end) {
          total += shift.assignments.length;
        }
      }

      counts.push({ hour, total });
    }

    return counts;
  }, [filteredShifts, activeDate, gridStartHour, gridEndHour]);

  function toggleExpand(shiftId: string) {
    setExpandedShiftId((current) => (current === shiftId ? null : shiftId));
  }

  async function handleRemoveVolunteer(shift: PlanningShift, assignmentId: number) {
    setBusyKey(`remove-${assignmentId}`);
    const result = await removeAssignment(assignmentId);
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setShifts((current) =>
      current.map((s) =>
        s.id === shift.id
          ? { ...s, assignments: s.assignments.filter((a) => a.assignmentId !== assignmentId) }
          : s,
      ),
    );

    setVolunteers((current) =>
      current.map((v) => ({
        ...v,
        assignments: v.assignments.filter((a) => a.assignmentId !== assignmentId),
      })),
    );
  }

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

  async function handleAddVolunteer(shift: PlanningShift, volunteer: VolunteerRow, force: boolean) {
    setBusyKey(`add-${shift.id}-${volunteer.id}`);
    const result = await addVolunteerToShift(shift.id, volunteer.id, { force });
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
              assignments: [
                ...s.assignments,
                {
                  assignmentId: result.data.assignmentId,
                  volunteerId: volunteer.id,
                  volunteerName: volunteer.name,
                  status: "pending" as const,
                  checkedInAt: null,
                },
              ],
            }
          : s,
      ),
    );

    setVolunteers((current) =>
      current.map((v) =>
        v.id === volunteer.id
          ? {
              ...v,
              assignments: [
                ...v.assignments,
                {
                  assignmentId: result.data.assignmentId,
                  shiftId: shift.id,
                  date: shift.date,
                  endDate: shift.endDate,
                  slot: shift.slot,
                  startTime: shift.startTime,
                  endTime: shift.endTime,
                  location: shift.location,
                  roleCategory: shift.roleCategory,
                  shiftTitle: shift.shiftTitle,
                  room: shift.room,
                  shiftLead: shift.shiftLead,
                  status: "pending" as const,
                  checkedInAt: null,
                },
              ],
            }
          : v,
      ),
    );

    setAddVolunteerShiftId(null);
    setAddVolunteerQuery("");
  }

  const addVolunteerShift = shifts.find((s) => s.id === addVolunteerShiftId) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold">Timeline</h1>
      <p className="mt-1 text-slate-500">
        All of a day&apos;s shifts at a glance. Click a row to see and manage its
        volunteers.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {dates.map((date) => (
          <button
            key={date}
            type="button"
            onClick={() => setSelectedDate(date)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              date === activeDate
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {formatShortDate(date)}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All shift types</option>
          {ROLE_CATEGORIES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <select
          value={shiftLeadFilter}
          onChange={(e) => setShiftLeadFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All shift leads</option>
          {shiftLeads.map((lead) => (
            <option key={lead} value={lead}>
              {lead}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Clear filters
        </button>
      </div>

      {activeDate && (
        <h2 className="mt-6 text-xl font-bold">{formatLongDate(activeDate)}</h2>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Type:</span>
          {legendCategories.map((category) => {
            const style = roleStyle(category);
            return (
              <span key={category} className="inline-flex items-center gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-black/10 ${style.barLightClassName}`}
                />
                {category}
              </span>
            );
          })}
        </div>
        <span className="text-xs text-slate-400">Light fill = filled, grey = still open</span>
      </div>

      {/* Bounded height + its own vertical scroll (not just overflow-x) is
          what makes `sticky top-0` on the hour header actually engage — an
          unbounded-height auto-overflow container never has real vertical
          overflow for the header to stick against, so it just scrolls away
          with the page instead. */}
      <div className="mt-3 max-h-[75vh] overflow-auto rounded-xl border border-slate-200 bg-white">
        <div style={{ minWidth: isMobile ? Math.max(420, totalHours * 44) : Math.max(720, totalHours * 72) }}>
          <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-slate-50 py-2 text-xs font-medium text-slate-500">
            <div className="hidden w-64 shrink-0 px-3 sm:block">Shift</div>
            <div className="relative flex-1">
              {hourMarks.map((hour) => {
                // Centering every label works for the ones in the middle,
                // but centering the very first/last one puts half its width
                // outside the scrollable area, where it gets clipped by the
                // container's own edge — so the two ends anchor inward
                // instead of straddling the boundary.
                const isFirst = hour === gridStartHour;
                const isLast = hour === gridEndHour;
                return (
                  <span
                    key={hour}
                    className={`absolute ${isFirst ? "" : isLast ? "-translate-x-full" : "-translate-x-1/2"}`}
                    style={{ left: `${percentFor(hour * 60)}%` }}
                  >
                    {String(((hour % 24) + 24) % 24).padStart(2, "0")}
                  </span>
                );
              })}
            </div>
          </div>

          {filteredShifts.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              No shifts match the current filters.
            </p>
          )}

          {filteredShifts.map((shift) => {
            const style = roleStyle(shift.roleCategory);
            const filled = shift.assignments.length;
            const needed = Math.max(1, shift.volunteersNeeded);
            const filledPct = Math.min(100, Math.round((filled / needed) * 100));
            const openSpots = shift.volunteersNeeded - shift.assignments.length;

            const barStart = minutesFromDayStart(activeDate, shift.date, shift.startTime);
            const barEnd = minutesFromDayStart(activeDate, shift.endDate, shift.endTime);
            const barLeft = percentFor(barStart);
            const barWidth = Math.max(2, percentFor(barEnd) - barLeft);

            const expanded = expandedShiftId === shift.id;

            return (
              <div key={shift.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(shift.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleExpand(shift.id);
                    }
                  }}
                  className="flex cursor-pointer border-b border-slate-50 hover:bg-slate-50"
                >
                  <div className="hidden w-64 shrink-0 px-3 py-3 sm:block">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {shift.shiftTitle || shift.roleCategory}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {shift.location}
                      {shift.room && ` · ${shift.room}`} · {shift.startTime}–{shift.endTime}
                      {(shift.endDate !== shift.date || shift.date !== activeDate) && (
                        <span
                          title={
                            shift.date !== activeDate
                              ? `Clock date is ${shift.date} — shown here as the tail end of ${activeDate}'s evening`
                              : `Ends ${shift.endDate}`
                          }
                          className="ml-1 font-semibold text-amber-600"
                        >
                          +1d
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="relative h-16 flex-1 px-2 py-2 sm:h-[60px]">
                    {hourMarks.map((hour) => (
                      <div
                        key={hour}
                        className="absolute top-0 bottom-0 border-l border-slate-100"
                        style={{ left: `${percentFor(hour * 60)}%` }}
                      />
                    ))}
                    {/* On a phone there's no separate label column (hidden
                        above), so the shift's name/time live inside the bar
                        itself — stacked above the count — instead of a
                        floating label outside it that only added another
                        thing to scroll past. */}
                    <div
                      className="absolute inset-y-2 overflow-hidden rounded-md border border-slate-200"
                      style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                      title={`${shift.roleCategory} · ${filled} / ${shift.volunteersNeeded} assigned`}
                    >
                      <div className="flex h-full">
                        <div className={style.barLightClassName} style={{ width: `${filledPct}%` }} />
                        <div className="bg-slate-200" style={{ width: `${100 - filledPct}%` }} />
                      </div>
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 overflow-hidden px-1 text-center">
                        <span className="w-full truncate text-[10px] font-medium text-slate-600 sm:hidden">
                          {shift.shiftTitle || shift.roleCategory} · {shift.startTime}–{shift.endTime}
                        </span>
                        <span className="truncate text-[11px] font-semibold text-slate-700">
                          {filled} / {shift.volunteersNeeded}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {expanded && (
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${style.badgeClassName}`}>
                        <span>{style.emoji}</span>
                        {shift.roleCategory}
                      </span>
                      {shift.shiftLead && <span>Shift lead: {shift.shiftLead}</span>}
                      {shift.eventContext && <span>Context: {shift.eventContext}</span>}
                    </div>

                    {/* Content-width chips, not equal grid columns — a name
                        and a Remove button don't need a whole stretched grid
                        cell to themselves. */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {shift.assignments.map((assignment) => (
                        <div
                          key={assignment.assignmentId}
                          className="flex min-w-[140px] flex-col gap-1 rounded-md bg-white px-2 py-1.5 text-xs"
                        >
                          <span className="break-words font-medium text-slate-900">
                            {assignment.volunteerName}
                          </span>
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${ASSIGNMENT_STATUS_STYLES[assignment.status]}`}
                            >
                              {assignment.status === "confirmed" ? "Confirmed" : "Pending"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveVolunteer(shift, assignment.assignmentId)}
                              disabled={busyKey === `remove-${assignment.assignmentId}`}
                              className="rounded bg-red-50 px-1.5 py-0.5 text-red-600 hover:bg-red-100 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                          {assignment.status === "confirmed" && (
                            <button
                              type="button"
                              onClick={() => handleToggleCheckedIn(shift, assignment)}
                              disabled={busyKey === `checkin-${assignment.assignmentId}`}
                              title={
                                assignment.checkedInAt
                                  ? `Checked in at ${new Date(assignment.checkedInAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                                  : "Mark as checked in"
                              }
                              className={`w-full rounded px-2 py-1 text-center font-medium disabled:opacity-50 ${
                                assignment.checkedInAt
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {assignment.checkedInAt ? "Checked in ✓" : "Check in"}
                            </button>
                          )}
                        </div>
                      ))}

                      {openSpots > 0 && (
                        <div className="flex min-w-[140px] items-center rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-700">
                          {openSpots} open spot{openSpots === 1 ? "" : "s"}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setAddVolunteerShiftId(shift.id)}
                      className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      + Add volunteer
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex border-t-2 border-slate-300 bg-slate-50">
            <div className="hidden w-64 shrink-0 px-3 py-2 text-xs font-semibold text-slate-600 sm:block">
              Scheduled / hour
            </div>
            <div className="relative flex-1" style={{ height: 32 }}>
              {hourlyHeadcount.map(({ hour, total }) => (
                <span
                  key={hour}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-slate-700"
                  style={{ left: `${percentFor(hour * 60 + 30)}%` }}
                >
                  {total}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {addVolunteerShift && (
        <Modal
          onClose={() => {
            setAddVolunteerShiftId(null);
            setAddVolunteerQuery("");
            setAddVolunteerOverride(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">
                  Add volunteer to {addVolunteerShift.roleCategory}
                </h3>
                <p className="text-sm text-slate-500">{addVolunteerShift.location}</p>
              </div>
              <button
                type="button"
                onClick={() => setAddVolunteerOverride((current) => !current)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  addVolunteerOverride
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {addVolunteerOverride ? "Override: on" : "Override"}
              </button>
            </div>

            <input
              type="text"
              autoFocus
              placeholder="Search by name, email or volunteer ID..."
              value={addVolunteerQuery}
              onChange={(e) => setAddVolunteerQuery(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />

            {addVolunteerOverride ? (
              <p className="mt-1 rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">
                Override is on — every volunteer is shown, including ones who
                aren&apos;t available or already have an overlapping shift.
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                Only volunteers who are available and have no overlapping shift are shown.
              </p>
            )}

            <div className="mt-3 max-h-64 overflow-y-auto">
              {volunteers
                .filter((v) => {
                  const query = addVolunteerQuery.trim().toLowerCase();
                  if (!query) return true;
                  return (
                    v.name.toLowerCase().includes(query) ||
                    v.email.toLowerCase().includes(query) ||
                    v.id.toLowerCase().includes(query)
                  );
                })
                .filter(
                  (v) => !addVolunteerShift.assignments.some((a) => a.volunteerId === v.id),
                )
                .filter((v) => {
                  if (addVolunteerOverride) return true;

                  const shiftInfo = {
                    date: addVolunteerShift.date,
                    endDate: addVolunteerShift.endDate,
                    slot: addVolunteerShift.slot,
                    startTime: addVolunteerShift.startTime,
                    endTime: addVolunteerShift.endTime,
                  };
                  const activeShifts = v.assignments
                    .filter((a) => a.status !== "cancelled")
                    .map((a) => ({
                      date: a.date,
                      endDate: a.endDate,
                      startTime: a.startTime,
                      endTime: a.endTime,
                    }));

                  return (
                    isVolunteerAvailableForShift(v.availability, shiftInfo) &&
                    !hasOverlap(shiftInfo, activeShifts)
                  );
                })
                .slice(0, 30)
                .map((volunteer) => {
                  const atLimit = hasReachedShiftPreference(volunteer);

                  return (
                    <button
                      key={volunteer.id}
                      type="button"
                      onClick={() =>
                        handleAddVolunteer(addVolunteerShift, volunteer, addVolunteerOverride)
                      }
                      disabled={busyKey === `add-${addVolunteerShift.id}-${volunteer.id}`}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm disabled:opacity-50 ${
                        atLimit ? "bg-orange-50 hover:bg-orange-100" : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {atLimit && (
                          <span
                            title="Already at their preferred shift count — try not to assign more"
                            className="h-2 w-2 shrink-0 rounded-full bg-orange-400"
                          />
                        )}
                        {volunteer.name}
                        <span className="ml-2 text-xs text-slate-400">{volunteer.email}</span>
                      </span>
                      <span className="text-indigo-600">+</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
