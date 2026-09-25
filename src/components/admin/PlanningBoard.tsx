"use client";

import { useMemo, useState } from "react";
import type { PlanningShift } from "@/lib/adminPlanning";
import type { VolunteerRow } from "@/lib/adminVolunteers";
import {
  addVolunteerToShift,
  createShift,
  deleteShift,
  removeAssignment,
} from "@/lib/adminActions";
import { isVolunteerAvailableForShift, hasOverlap } from "@/lib/shiftEligibility";
import { Modal } from "@/components/Modal";
import { ROLE_CATEGORIES, ROLE_STYLES, DEFAULT_ROLE_STYLE, TIME_SLOTS } from "@/lib/constants";

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

function ProgressBar({ assigned, needed }: { assigned: number; needed: number }) {
  const pct = needed > 0 ? Math.min(100, Math.round((assigned / needed) * 100)) : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-medium text-emerald-600">{pct}%</span>
    </div>
  );
}

export function PlanningBoard({
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
  const [createOpen, setCreateOpen] = useState(false);
  const [addVolunteerShiftId, setAddVolunteerShiftId] = useState<string | null>(
    null,
  );
  const [addVolunteerQuery, setAddVolunteerQuery] = useState("");

  const dates = useMemo(
    () => Array.from(new Set(shifts.map((s) => s.date))).sort(),
    [shifts],
  );

  const [selectedDate, setSelectedDate] = useState(dates[0] ?? "");
  const activeDate = dates.includes(selectedDate) ? selectedDate : dates[0] ?? "";

  const locations = useMemo(
    () => Array.from(new Set(shifts.map((s) => s.location))).sort(),
    [shifts],
  );

  const [locationFilter, setLocationFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [slotFilter, setSlotFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const shiftsForDate = useMemo(
    () => shifts.filter((s) => s.date === activeDate),
    [shifts, activeDate],
  );

  const filteredShifts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return shiftsForDate.filter((shift) => {
      if (locationFilter !== "all" && shift.location !== locationFilter) return false;
      if (roleFilter !== "all" && shift.roleCategory !== roleFilter) return false;
      if (slotFilter !== "all" && shift.slot !== slotFilter) return false;
      if (
        query &&
        !shift.assignments.some((a) => a.volunteerName.toLowerCase().includes(query))
      )
        return false;
      return true;
    });
  }, [shiftsForDate, locationFilter, roleFilter, slotFilter, searchQuery]);

  const dayTotals = filteredShifts.reduce(
    (acc, shift) => ({
      assigned: acc.assigned + shift.assignments.length,
      needed: acc.needed + shift.volunteersNeeded,
    }),
    { assigned: 0, needed: 0 },
  );

  const groupedByLocation = useMemo(() => {
    const map = new Map<string, PlanningShift[]>();
    for (const shift of filteredShifts) {
      const list = map.get(shift.location) ?? [];
      list.push(shift);
      map.set(shift.location, list);
    }
    return Array.from(map.entries());
  }, [filteredShifts]);

  async function handleDeleteShift(shift: PlanningShift) {
    if (!window.confirm(`Delete ${shift.roleCategory} at ${shift.location}?`)) {
      return;
    }

    setBusyKey(`delete-${shift.id}`);
    const result = await deleteShift(shift.id);
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setShifts((current) => current.filter((s) => s.id !== shift.id));
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

  async function handleAddVolunteer(shift: PlanningShift, volunteer: VolunteerRow) {
    setBusyKey(`add-${shift.id}-${volunteer.id}`);
    const result = await addVolunteerToShift(shift.id, volunteer.id);
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
                  startTime: shift.startTime,
                  endTime: shift.endTime,
                  location: shift.location,
                  roleCategory: shift.roleCategory,
                  status: "pending" as const,
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planning</h1>
          <p className="mt-1 text-slate-500">
            Manage all shifts by date and location. Add or remove volunteers and
            quickly see where help is still needed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="shrink-0 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Create shift
        </button>
      </div>

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
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

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
          value={slotFilter}
          onChange={(e) => setSlotFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All time slots</option>
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search volunteers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      {activeDate && (
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">{formatLongDate(activeDate)}</h2>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>
              Total assigned: <strong>{dayTotals.assigned} / {dayTotals.needed}</strong>
            </span>
            <ProgressBar assigned={dayTotals.assigned} needed={dayTotals.needed} />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {groupedByLocation.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500">
            No shifts match the current filters.
          </p>
        )}

        {groupedByLocation.map(([location, locationShifts]) => {
          const totals = locationShifts.reduce(
            (acc, s) => ({
              assigned: acc.assigned + s.assignments.length,
              needed: acc.needed + s.volunteersNeeded,
            }),
            { assigned: 0, needed: 0 },
          );

          const byTimeBlock = new Map<string, PlanningShift[]>();
          for (const shift of locationShifts) {
            const key = `${shift.startTime}-${shift.endTime}`;
            const list = byTimeBlock.get(key) ?? [];
            list.push(shift);
            byTimeBlock.set(key, list);
          }
          const timeBlocks = Array.from(byTimeBlock.entries()).sort(([a], [b]) =>
            a.localeCompare(b),
          );

          return (
            <div key={location} className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2 font-semibold">
                  <span>📍</span>
                  {location}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span>
                    {totals.assigned} / {totals.needed} assigned
                  </span>
                  <ProgressBar assigned={totals.assigned} needed={totals.needed} />
                </div>
              </div>

              {timeBlocks.map(([timeKey, blockShifts]) => {
                const [startTime, endTime] = timeKey.split("-");

                return (
                  <div key={timeKey} className="flex gap-4 border-b border-slate-50 p-4 last:border-b-0">
                    <div className="w-24 shrink-0 text-sm text-slate-500">
                      <div className="font-medium text-slate-700">
                        {startTime} – {endTime}
                      </div>
                      <div>({blockShifts[0].hours}h)</div>
                    </div>

                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {blockShifts.map((shift) => {
                        const style = roleStyle(shift.roleCategory);
                        const openSpots = shift.volunteersNeeded - shift.assignments.length;

                        return (
                          <div
                            key={shift.id}
                            className={`rounded-lg border p-3 ${style.cardClassName}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${style.badgeClassName}`}>
                                <span>{style.emoji}</span>
                                {shift.roleCategory}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteShift(shift)}
                                disabled={busyKey === `delete-${shift.id}`}
                                className="text-xs text-slate-400 hover:text-red-600 disabled:opacity-50"
                                title="Delete shift"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                              <span>{shift.location}</span>
                              <span className="font-semibold text-slate-700">
                                {shift.assignments.length} / {shift.volunteersNeeded}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-col gap-1">
                              {shift.assignments.map((assignment) => (
                                <div
                                  key={assignment.assignmentId}
                                  className="flex items-center justify-between rounded-md bg-white px-2 py-1 text-xs"
                                >
                                  <span className="truncate">{assignment.volunteerName}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVolunteer(shift, assignment.assignmentId)}
                                    disabled={busyKey === `remove-${assignment.assignmentId}`}
                                    className="ml-2 shrink-0 rounded bg-red-50 px-1.5 py-0.5 text-red-600 hover:bg-red-100 disabled:opacity-50"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}

                              {openSpots > 0 && (
                                <div className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700">
                                  {openSpots} open spot{openSpots === 1 ? "" : "s"}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setAddVolunteerShiftId(shift.id)}
                              className="mt-2 w-full rounded-md border border-slate-200 bg-white py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              + Add volunteer
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {createOpen && (
        <Modal onClose={() => setCreateOpen(false)}>
          <CreateShiftForm
            onCancel={() => setCreateOpen(false)}
            onCreate={async (input) => {
              setBusyKey("create");
              const result = await createShift(input);
              setBusyKey(null);

              if (!result.ok) {
                setError(result.error);
                return;
              }

              const day = new Date(`${input.date}T00:00:00`).toLocaleDateString(
                "en-US",
                { weekday: "long" },
              );

              setShifts((current) => [
                ...current,
                {
                  id: result.data.id,
                  date: input.date,
                  day,
                  slot: input.slot,
                  startTime: input.startTime,
                  endTime: input.endTime,
                  hours: input.hours,
                  location: input.location,
                  roleCategory: input.roleCategory,
                  volunteersNeeded: input.volunteersNeeded,
                  eventContext: input.eventContext,
                  assignments: [],
                },
              ]);
              setCreateOpen(false);
            }}
            busy={busyKey === "create"}
          />
        </Modal>
      )}

      {addVolunteerShift && (
        <Modal
          onClose={() => {
            setAddVolunteerShiftId(null);
            setAddVolunteerQuery("");
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">
              Add volunteer to {addVolunteerShift.roleCategory}
            </h3>
            <p className="text-sm text-slate-500">{addVolunteerShift.location}</p>

            <input
              type="text"
              autoFocus
              placeholder="Search by name, email or volunteer ID..."
              value={addVolunteerQuery}
              onChange={(e) => setAddVolunteerQuery(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />

            <p className="mt-1 text-xs text-slate-400">
              Only volunteers who are available and have no overlapping shift are shown.
            </p>

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
                  (v) =>
                    !addVolunteerShift.assignments.some((a) => a.volunteerId === v.id),
                )
                .filter((v) => {
                  const shiftInfo = {
                    date: addVolunteerShift.date,
                    slot: addVolunteerShift.slot,
                    startTime: addVolunteerShift.startTime,
                    endTime: addVolunteerShift.endTime,
                  };
                  const activeShifts = v.assignments
                    .filter((a) => a.status !== "cancelled")
                    .map((a) => ({ date: a.date, startTime: a.startTime, endTime: a.endTime }));

                  return (
                    isVolunteerAvailableForShift(v.availability, shiftInfo) &&
                    !hasOverlap(shiftInfo, activeShifts)
                  );
                })
                .slice(0, 30)
                .map((volunteer) => (
                  <button
                    key={volunteer.id}
                    type="button"
                    onClick={() => handleAddVolunteer(addVolunteerShift, volunteer)}
                    disabled={busyKey === `add-${addVolunteerShift.id}-${volunteer.id}`}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    <span>
                      {volunteer.name}
                      <span className="ml-2 text-xs text-slate-400">{volunteer.email}</span>
                    </span>
                    <span className="text-indigo-600">+</span>
                  </button>
                ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CreateShiftForm({
  onCancel,
  onCreate,
  busy,
}: {
  onCancel: () => void;
  onCreate: (input: {
    date: string;
    slot: string;
    startTime: string;
    endTime: string;
    hours: number;
    location: string;
    roleCategory: string;
    volunteersNeeded: number;
    eventContext: string;
  }) => void;
  busy: boolean;
}) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string>(TIME_SLOTS[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [hours, setHours] = useState(4);
  const [location, setLocation] = useState("");
  const [roleCategory, setRoleCategory] = useState<string>(ROLE_CATEGORIES[0]);
  const [volunteersNeeded, setVolunteersNeeded] = useState(1);
  const [eventContext, setEventContext] = useState("");

  const isValid = date && location.trim() && startTime && endTime && hours > 0 && volunteersNeeded > 0;

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <h3 className="text-lg font-bold">Create shift</h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="col-span-2 text-sm">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          Slot
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            {TIME_SLOTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          Volunteers needed
          <input
            type="number"
            min={1}
            value={volunteersNeeded}
            onChange={(e) => setVolunteersNeeded(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          Start time
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          End time
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          Hours
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          Shift type
          <select
            value={roleCategory}
            onChange={(e) => setRoleCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            {ROLE_CATEGORIES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>

        <label className="col-span-2 text-sm">
          Location
          <input
            type="text"
            placeholder="e.g. Vooruit - Concertzaal"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="col-span-2 text-sm">
          Context (optional)
          <input
            type="text"
            placeholder="e.g. Hackathon setup"
            value={eventContext}
            onChange={(e) => setEventContext(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!isValid || busy}
          onClick={() =>
            onCreate({
              date,
              slot,
              startTime,
              endTime,
              hours,
              location: location.trim(),
              roleCategory,
              volunteersNeeded,
              eventContext: eventContext.trim(),
            })
          }
          className="flex-1 rounded-full bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Create shift
        </button>
      </div>
    </div>
  );
}
