"use client";

import { useMemo, useState } from "react";
import type { PlanningShift } from "@/lib/adminPlanning";
import {
  createShift,
  deleteShift,
  updateShiftLead,
  updateVolunteersNeeded,
  updateTectonicResponsible,
  updateShiftDetails,
} from "@/lib/adminActions";
import { Modal } from "@/components/Modal";
import {
  ROLE_CATEGORIES,
  ROLE_STYLES,
  DEFAULT_ROLE_STYLE,
  deriveSlotFromStartTime,
  computeHoursBetween,
} from "@/lib/constants";
import { splitShiftLeads, hasTectonicResponsible } from "@/lib/shiftLead";

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

// "TBC" is the literal placeholder value `shift_lead` (and now
// `tectonic_responsible`) holds before a real value is picked — never
// combined with a real name, so checking for it as the sole entry is enough.
function realLeads(rawShiftLead: string): string[] {
  return splitShiftLeads(rawShiftLead).filter((lead) => lead !== "TBC");
}

function distinctSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

// Location + specific room are filtered together as one combo (e.g.
// "VierNulVier · Concertzaal") since the same location hosts several rooms
// at once — filtering by location alone wouldn't narrow much. "|||" is just
// an encoding separator for the <option> value, never shown to the user.
function locationRoomKey(location: string, room: string): string {
  return `${location}|||${room}`;
}

function locationRoomLabel(location: string, room: string): string {
  return room ? `${location} · ${room}` : location;
}

function PencilIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 ${className}`}
      aria-hidden="true"
    >
      <path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

type ShiftDetailsInput = {
  shiftTitle: string;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  location: string;
  room: string;
  roleCategory: string;
  eventContext: string;
  extraInfo: string;
};

export function ShiftsBoard({ initialShifts }: { initialShifts: PlanningShift[] }) {
  const [shifts, setShifts] = useState(initialShifts);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [shiftLeadFilter, setShiftLeadFilter] = useState("all");
  const [tbcOnly, setTbcOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [addingLeadFor, setAddingLeadFor] = useState<string | null>(null);
  const [newLeadName, setNewLeadName] = useState("");

  const [editingCountFor, setEditingCountFor] = useState<string | null>(null);
  const [tempCount, setTempCount] = useState(1);

  const [editingResponsibleFor, setEditingResponsibleFor] = useState<string | null>(null);
  const [tempResponsible, setTempResponsible] = useState("");

  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<ShiftDetailsInput | null>(null);

  const [deleteConfirmShiftId, setDeleteConfirmShiftId] = useState<string | null>(null);

  const knownLocations = useMemo(
    () => distinctSorted(shifts.map((s) => s.location)),
    [shifts],
  );
  const knownRooms = useMemo(() => distinctSorted(shifts.map((s) => s.room)), [shifts]);
  const knownLeads = useMemo(
    () => distinctSorted(shifts.flatMap((s) => realLeads(s.shiftLead))),
    [shifts],
  );

  const knownDates = useMemo(() => distinctSorted(shifts.map((s) => s.date)), [shifts]);

  const knownLocationRoomOptions = useMemo(() => {
    const byKey = new Map<string, { location: string; room: string }>();
    for (const s of shifts) {
      byKey.set(locationRoomKey(s.location, s.room), { location: s.location, room: s.room });
    }
    return Array.from(byKey.entries())
      .map(([key, { location, room }]) => ({ key, label: locationRoomLabel(location, room) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [shifts]);

  const tbcCount = useMemo(
    () => shifts.filter((s) => realLeads(s.shiftLead).length === 0).length,
    [shifts],
  );

  const sortedShifts = useMemo(
    () =>
      [...shifts].sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)),
    [shifts],
  );

  const filteredShifts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return sortedShifts.filter((shift) => {
      if (
        q &&
        !shift.id.toLowerCase().includes(q) &&
        !shift.shiftTitle.toLowerCase().includes(q) &&
        !shift.shiftLead.toLowerCase().includes(q)
      )
        return false;

      if (typeFilter !== "all" && shift.roleCategory !== typeFilter) return false;

      if (shiftLeadFilter !== "all" && !realLeads(shift.shiftLead).includes(shiftLeadFilter))
        return false;

      if (tbcOnly && realLeads(shift.shiftLead).length > 0) return false;

      if (dateFilter !== "all" && shift.date !== dateFilter) return false;

      if (
        locationFilter !== "all" &&
        locationRoomKey(shift.location, shift.room) !== locationFilter
      )
        return false;

      return true;
    });
  }, [sortedShifts, query, typeFilter, shiftLeadFilter, tbcOnly, dateFilter, locationFilter]);

  function clearFilters() {
    setQuery("");
    setTypeFilter("all");
    setShiftLeadFilter("all");
    setTbcOnly(false);
    setDateFilter("all");
    setLocationFilter("all");
  }

  async function handleAddLead(shift: PlanningShift) {
    const trimmed = newLeadName.trim();
    if (!trimmed) {
      setAddingLeadFor(null);
      return;
    }

    const next = [...realLeads(shift.shiftLead), trimmed].join(";");

    setBusyKey(`lead-${shift.id}`);
    const result = await updateShiftLead(shift.id, next);
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setShifts((current) =>
      current.map((s) => (s.id === shift.id ? { ...s, shiftLead: result.data.shiftLead } : s)),
    );
    setAddingLeadFor(null);
    setNewLeadName("");
  }

  async function handleRemoveLead(shift: PlanningShift, lead: string) {
    const next = realLeads(shift.shiftLead)
      .filter((l) => l !== lead)
      .join(";");

    setBusyKey(`lead-${shift.id}`);
    const result = await updateShiftLead(shift.id, next);
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setShifts((current) =>
      current.map((s) => (s.id === shift.id ? { ...s, shiftLead: result.data.shiftLead } : s)),
    );
  }

  async function handleConfirmCount(shift: PlanningShift) {
    setBusyKey(`count-${shift.id}`);
    const result = await updateVolunteersNeeded(shift.id, tempCount);
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setShifts((current) =>
      current.map((s) =>
        s.id === shift.id ? { ...s, volunteersNeeded: result.data.volunteersNeeded } : s,
      ),
    );
    setEditingCountFor(null);
  }

  async function handleConfirmResponsible(shift: PlanningShift) {
    setBusyKey(`responsible-${shift.id}`);
    const result = await updateTectonicResponsible(shift.id, tempResponsible);
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setShifts((current) =>
      current.map((s) =>
        s.id === shift.id ? { ...s, tectonicResponsible: result.data.tectonicResponsible } : s,
      ),
    );
    setEditingResponsibleFor(null);
  }

  function startEditingShift(shift: PlanningShift) {
    setEditingShiftId(shift.id);
    setEditValues({
      shiftTitle: shift.shiftTitle,
      date: shift.date,
      endDate: shift.endDate,
      startTime: shift.startTime,
      endTime: shift.endTime,
      hours: shift.hours,
      location: shift.location,
      room: shift.room,
      roleCategory: shift.roleCategory,
      eventContext: shift.eventContext,
      extraInfo: shift.extraInfo,
    });
  }

  function updateEditValues(patch: Partial<ShiftDetailsInput>) {
    setEditValues((current) => (current ? { ...current, ...patch } : current));
  }

  async function handleSaveShiftDetails(shift: PlanningShift) {
    if (!editValues) return;

    setBusyKey(`details-${shift.id}`);
    const result = await updateShiftDetails(shift.id, {
      ...editValues,
      slot: deriveSlotFromStartTime(editValues.startTime),
    });
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
              ...editValues,
              slot: deriveSlotFromStartTime(editValues.startTime),
              day: result.data.day,
            }
          : s,
      ),
    );
    setEditingShiftId(null);
    setEditValues(null);
  }

  async function handleDeleteShift(shift: PlanningShift) {
    setBusyKey(`delete-${shift.id}`);
    const result = await deleteShift(shift.id);
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      setDeleteConfirmShiftId(null);
      return;
    }

    setShifts((current) => current.filter((s) => s.id !== shift.id));
    setDeleteConfirmShiftId(null);
  }

  const deleteConfirmShift = shifts.find((s) => s.id === deleteConfirmShiftId) ?? null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shifts</h1>
          <p className="mt-1 text-slate-500">
            Manage shift leads and how many volunteers each shift needs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="shrink-0 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add shift
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by shift name, ID or shift lead"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-64 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
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
          {knownLeads.map((lead) => (
            <option key={lead} value={lead}>
              {lead}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={tbcOnly}
            onChange={(e) => setTbcOnly(e.target.checked)}
          />
          TBC
        </label>

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

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All locations</option>
          {knownLocationRoomOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
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

      <p className="mt-3 text-right text-sm text-slate-500">
        {filteredShifts.length} of {shifts.length} shifts · {tbcCount} TBC
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Click a shift&apos;s title to edit its details. Click the + to add a shift lead, the × to
        remove one, or a number to change it.
      </p>

      <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {filteredShifts.length === 0 ? (
          <p className="px-4 py-8 text-center text-slate-500">
            No shifts match the current filters.
          </p>
        ) : (
          filteredShifts.map((shift) => {
            const style = roleStyle(shift.roleCategory);
            const leads = realLeads(shift.shiftLead);
            const isTbcShift = leads.length === 0;
            const isEditingCount = editingCountFor === shift.id;
            const isAddingLead = addingLeadFor === shift.id;
            const isEditingResponsible = editingResponsibleFor === shift.id;
            const isEditingShift = editingShiftId === shift.id;

            return (
              <div key={shift.id} className="px-4 py-4">
                {isEditingShift && editValues ? (
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="col-span-2 text-xs text-slate-500">
                        Shift title
                        <input
                          type="text"
                          value={editValues.shiftTitle}
                          onChange={(e) => updateEditValues({ shiftTitle: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </label>

                      <label className="text-xs text-slate-500">
                        Date
                        <input
                          type="date"
                          value={editValues.date}
                          onChange={(e) =>
                            updateEditValues({
                              date: e.target.value,
                              hours: computeHoursBetween(
                                e.target.value,
                                editValues.startTime,
                                editValues.endDate,
                                editValues.endTime,
                              ),
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </label>

                      <label className="text-xs text-slate-500">
                        End date
                        <input
                          type="date"
                          value={editValues.endDate}
                          onChange={(e) =>
                            updateEditValues({
                              endDate: e.target.value,
                              hours: computeHoursBetween(
                                editValues.date,
                                editValues.startTime,
                                e.target.value,
                                editValues.endTime,
                              ),
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </label>

                      <label className="text-xs text-slate-500">
                        Start time
                        <input
                          type="time"
                          value={editValues.startTime}
                          onChange={(e) =>
                            updateEditValues({
                              startTime: e.target.value,
                              hours: computeHoursBetween(
                                editValues.date,
                                e.target.value,
                                editValues.endDate,
                                editValues.endTime,
                              ),
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </label>

                      <label className="text-xs text-slate-500">
                        End time
                        <input
                          type="time"
                          value={editValues.endTime}
                          onChange={(e) =>
                            updateEditValues({
                              endTime: e.target.value,
                              hours: computeHoursBetween(
                                editValues.date,
                                editValues.startTime,
                                editValues.endDate,
                                e.target.value,
                              ),
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </label>

                      <label className="text-xs text-slate-500">
                        Shift type
                        <select
                          value={editValues.roleCategory}
                          onChange={(e) => updateEditValues({ roleCategory: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        >
                          {ROLE_CATEGORIES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs text-slate-500">
                        Location
                        <select
                          value={editValues.location}
                          onChange={(e) => updateEditValues({ location: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        >
                          <option value="TBC">TBC</option>
                          {knownLocations.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs text-slate-500">
                        Room
                        <select
                          value={editValues.room}
                          onChange={(e) => updateEditValues({ room: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        >
                          <option value="">No specific room</option>
                          <option value="TBC">TBC</option>
                          {knownRooms.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="col-span-2 text-xs text-slate-500">
                        Context (optional)
                        <input
                          type="text"
                          value={editValues.eventContext}
                          onChange={(e) => updateEditValues({ eventContext: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </label>

                      <label className="col-span-2 text-xs text-slate-500">
                        Description (shown to volunteers as &quot;What you&apos;ll do&quot;)
                        <textarea
                          value={editValues.extraInfo}
                          onChange={(e) => updateEditValues({ extraInfo: e.target.value })}
                          rows={3}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </label>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingShiftId(null);
                          setEditValues(null);
                        }}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveShiftDetails(shift)}
                        disabled={busyKey === `details-${shift.id}`}
                        className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => startEditingShift(shift)}
                      className="group block min-w-0 flex-1 text-left"
                      title="Click to edit this shift's details"
                    >
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-mono text-xs text-slate-400">{shift.id}</span>
                        <p className="font-semibold text-slate-900">
                          {shift.shiftTitle || shift.roleCategory}
                        </p>
                        {shift.isTemplate && (
                          <span
                            title="Part of a multi-block template — see the volunteer's Rotation shift"
                            className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
                          >
                            Template
                          </span>
                        )}
                        <PencilIcon className="text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span>
                          {formatShortDate(shift.date)} · {shift.startTime}–{shift.endTime}
                          {shift.endDate !== shift.date && (
                            <span className="ml-1 align-top text-[10px] font-semibold text-amber-600">
                              +1d
                            </span>
                          )}
                        </span>
                        <span>
                          {shift.location}
                          {shift.room && ` · ${shift.room}`}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.badgeClassName}`}
                        >
                          {shift.roleCategory}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmShiftId(shift.id)}
                      aria-label="Delete this shift"
                      title="Delete this shift"
                      className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {isTbcShift && !isAddingLead && (
                      <span className="text-sm font-medium text-orange-600">TBC</span>
                    )}

                    {leads.map((lead) => (
                      <span
                        key={lead}
                        className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                      >
                        {lead}
                        <button
                          type="button"
                          onClick={() => handleRemoveLead(shift, lead)}
                          disabled={busyKey === `lead-${shift.id}`}
                          aria-label={`Remove ${lead} as shift lead`}
                          className="text-slate-400 hover:text-red-600 disabled:opacity-50"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    {isAddingLead ? (
                      <span className="flex items-center gap-1.5">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Name"
                          value={newLeadName}
                          onChange={(e) => setNewLeadName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddLead(shift);
                            if (e.key === "Escape") {
                              setAddingLeadFor(null);
                              setNewLeadName("");
                            }
                          }}
                          className="w-28 rounded-full border border-indigo-300 px-3 py-1 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddLead(shift)}
                          disabled={busyKey === `lead-${shift.id}`}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          <CheckIcon />
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingLeadFor(shift.id);
                          setNewLeadName("");
                        }}
                        aria-label="Add a shift lead"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500"
                      >
                        +
                      </button>
                    )}
                  </div>

                  <div className="group flex items-center gap-1.5">
                    {isEditingCount ? (
                      <>
                        <input
                          type="number"
                          min={1}
                          autoFocus
                          value={tempCount}
                          onChange={(e) => setTempCount(Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleConfirmCount(shift);
                            if (e.key === "Escape") setEditingCountFor(null);
                          }}
                          className="w-16 rounded-lg border-2 border-indigo-400 px-2 py-1 text-center text-sm font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleConfirmCount(shift)}
                          disabled={busyKey === `count-${shift.id}`}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          <CheckIcon />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCountFor(shift.id);
                          setTempCount(shift.volunteersNeeded);
                        }}
                        title="Click to change how many volunteers are needed"
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-slate-100"
                      >
                        <PencilIcon className="text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                        <span className="text-base font-bold text-slate-900">
                          {shift.volunteersNeeded}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {isEditingResponsible ? (
                    <span className="flex items-center gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Name"
                        value={tempResponsible}
                        onChange={(e) => setTempResponsible(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmResponsible(shift);
                          if (e.key === "Escape") setEditingResponsibleFor(null);
                        }}
                        className="w-40 rounded-full border border-indigo-300 px-3 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleConfirmResponsible(shift)}
                        disabled={busyKey === `responsible-${shift.id}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        <CheckIcon />
                      </button>
                    </span>
                  ) : hasTectonicResponsible(shift.tectonicResponsible) ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingResponsibleFor(shift.id);
                        setTempResponsible(shift.tectonicResponsible);
                      }}
                      className="group/resp flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-200"
                    >
                      <span className="font-semibold text-slate-500">Tectonic responsible</span>
                      {shift.tectonicResponsible}
                      <PencilIcon className="text-slate-400 opacity-0 transition-opacity group-hover/resp:opacity-100" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingResponsibleFor(shift.id);
                        setTempResponsible("");
                      }}
                      className="text-[11px] font-medium text-slate-400 hover:text-indigo-500"
                    >
                      + Add tectonic responsible
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {createOpen && (
        <Modal onClose={() => setCreateOpen(false)}>
          <CreateShiftForm
            onCancel={() => setCreateOpen(false)}
            busy={busyKey === "create"}
            knownLocations={knownLocations}
            knownRooms={knownRooms}
            knownLeads={knownLeads}
            onCreate={async (input) => {
              setBusyKey("create");
              const result = await createShift(input);
              setBusyKey(null);

              if (!result.ok) {
                setError(result.error);
                return;
              }

              const day = new Date(`${input.date}T00:00:00`).toLocaleDateString("en-US", {
                weekday: "long",
              });

              setShifts((current) => [
                ...current,
                {
                  id: result.data.id,
                  date: input.date,
                  endDate: input.endDate,
                  day,
                  slot: input.slot,
                  startTime: input.startTime,
                  endTime: input.endTime,
                  hours: input.hours,
                  location: input.location,
                  roleCategory: input.roleCategory,
                  volunteersNeeded: input.volunteersNeeded,
                  eventContext: input.eventContext,
                  shiftLead: input.shiftLead || "TBC",
                  tectonicResponsible: input.tectonicResponsible || "TBC",
                  shiftTitle: input.shiftTitle,
                  room: input.room,
                  extraInfo: "",
                  isTemplate: false,
                  templateKey: "",
                  assignments: [],
                },
              ]);
              setCreateOpen(false);
            }}
          />
        </Modal>
      )}

      {deleteConfirmShift && (
        <Modal onClose={() => setDeleteConfirmShiftId(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">Delete this shift?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {deleteConfirmShift.shiftTitle || deleteConfirmShift.roleCategory}
              </span>{" "}
              ({deleteConfirmShift.id})? This also removes every volunteer&apos;s assignment to
              it. This can&apos;t be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmShiftId(null)}
                className="flex-1 rounded-full border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyKey === `delete-${deleteConfirmShift.id}`}
                onClick={() => handleDeleteShift(deleteConfirmShift)}
                className="flex-1 rounded-full bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
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
  knownLocations,
  knownRooms,
  knownLeads,
}: {
  onCancel: () => void;
  onCreate: (input: {
    date: string;
    endDate: string;
    slot: string;
    startTime: string;
    endTime: string;
    hours: number;
    location: string;
    roleCategory: string;
    volunteersNeeded: number;
    eventContext: string;
    shiftLead: string;
    shiftTitle: string;
    room: string;
    tectonicResponsible: string;
  }) => void;
  busy: boolean;
  knownLocations: string[];
  knownRooms: string[];
  knownLeads: string[];
}) {
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [hours, setHours] = useState(0);
  const [location, setLocation] = useState("TBC");
  const [room, setRoom] = useState("");
  const [roleCategory, setRoleCategory] = useState<string>(ROLE_CATEGORIES[0]);
  const [volunteersNeeded, setVolunteersNeeded] = useState(1);
  const [eventContext, setEventContext] = useState("");
  const [shiftLead, setShiftLead] = useState("TBC");
  const [shiftTitle, setShiftTitle] = useState("");
  const [tectonicResponsible, setTectonicResponsible] = useState("");

  function handleDateChange(value: string) {
    const endDateWasLinked = endDate === date;
    setDate(value);
    if (endDateWasLinked) {
      setEndDate(value);
      setHours(computeHoursBetween(value, startTime, value, endTime));
    } else {
      setHours(computeHoursBetween(value, startTime, endDate, endTime));
    }
  }

  function handleEndDateChange(value: string) {
    setEndDate(value);
    setHours(computeHoursBetween(date, startTime, value, endTime));
  }

  function handleStartTimeChange(value: string) {
    setStartTime(value);
    setHours(computeHoursBetween(date, value, endDate, endTime));
  }

  function handleEndTimeChange(value: string) {
    setEndTime(value);
    setHours(computeHoursBetween(date, startTime, endDate, value));
  }

  const isValid =
    date && endDate && location.trim() && startTime && endTime && hours > 0 && volunteersNeeded > 0;

  return (
    <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <h3 className="text-lg font-bold">Add shift</h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="col-span-2 text-sm">
          Shift title
          <input
            type="text"
            placeholder="e.g. Meeting Hub build-up"
            value={shiftTitle}
            onChange={(e) => setShiftTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          Start date
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          Start time
          <input
            type="time"
            value={startTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          End date
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          End time
          <input
            type="time"
            value={endTime}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        <p className="col-span-2 -mt-1 text-xs text-slate-400">
          Be aware 00:00 is at start of day, not end of day.
        </p>

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
          Hours
          <input
            type="number"
            readOnly
            value={hours}
            className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
          />
          <span className="mt-1 block text-xs text-slate-400">
            Filled in automatically from start/end date and time.
          </span>
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

        <label className="text-sm">
          Shift lead
          <select
            value={shiftLead}
            onChange={(e) => setShiftLead(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="TBC">TBC</option>
            {knownLeads.map((lead) => (
              <option key={lead} value={lead}>
                {lead}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          Location
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="TBC">TBC</option>
            {knownLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          Room (optional)
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="">No specific room</option>
            <option value="TBC">TBC</option>
            {knownRooms.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="col-span-2 text-sm">
          Tectonic responsible (optional)
          <input
            type="text"
            placeholder="e.g. Kaat De Jonge (leave blank for TBC)"
            value={tectonicResponsible}
            onChange={(e) => setTectonicResponsible(e.target.value)}
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
              endDate,
              slot: deriveSlotFromStartTime(startTime),
              startTime,
              endTime,
              hours,
              location: location.trim(),
              roleCategory,
              volunteersNeeded,
              eventContext: eventContext.trim(),
              shiftLead: shiftLead.trim(),
              shiftTitle: shiftTitle.trim(),
              room: room.trim(),
              tectonicResponsible: tectonicResponsible.trim(),
            })
          }
          className="flex-1 rounded-full bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Add shift
        </button>
      </div>
    </div>
  );
}
