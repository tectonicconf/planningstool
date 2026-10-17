"use client";

import { useMemo, useState } from "react";
import type { TemplateGroup, PlanningShift, PlanningAssignment } from "@/lib/adminPlanning";
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
} from "@/lib/shiftEligibility";
import { Modal } from "@/components/Modal";
import { ROLE_STYLES, DEFAULT_ROLE_STYLE } from "@/lib/constants";
import { formatShiftLead } from "@/lib/shiftLead";

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

const ASSIGNMENT_STATUS_STYLES: Record<"pending" | "confirmed", string> = {
  pending: "bg-blue-100 text-blue-700",
  confirmed: "bg-emerald-100 text-emerald-700",
};

function ProgressBar({ assigned, needed }: { assigned: number; needed: number }) {
  const pct = needed > 0 ? Math.min(100, Math.round((assigned / needed) * 100)) : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium text-emerald-600">{pct}%</span>
    </div>
  );
}

export function TemplatesBoard({
  initialGroups,
  volunteers: initialVolunteers,
}: {
  initialGroups: TemplateGroup[];
  volunteers: VolunteerRow[];
}) {
  const [groups, setGroups] = useState(initialGroups);
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addVolunteerShiftId, setAddVolunteerShiftId] = useState<string | null>(null);
  const [addVolunteerQuery, setAddVolunteerQuery] = useState("");
  const [addVolunteerOverride, setAddVolunteerOverride] = useState(false);

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return groups;

    return groups.filter((group) =>
      group.blocks.some(
        (block) =>
          block.shiftTitle.toLowerCase().includes(query) ||
          block.location.toLowerCase().includes(query) ||
          block.roleCategory.toLowerCase().includes(query) ||
          block.shiftLead.toLowerCase().includes(query) ||
          block.assignments.some((a) => a.volunteerName.toLowerCase().includes(query)),
      ),
    );
  }, [groups, searchQuery]);

  function updateBlock(shiftId: string, updater: (block: PlanningShift) => PlanningShift) {
    setGroups((current) =>
      current.map((group) => ({
        ...group,
        blocks: group.blocks.map((block) => (block.id === shiftId ? updater(block) : block)),
      })),
    );
  }

  async function handleRemoveVolunteer(shiftId: string, assignmentId: number) {
    setBusyKey(`remove-${assignmentId}`);
    const result = await removeAssignment(assignmentId);
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    updateBlock(shiftId, (block) => ({
      ...block,
      assignments: block.assignments.filter((a) => a.assignmentId !== assignmentId),
    }));
    setVolunteers((current) =>
      current.map((v) => ({
        ...v,
        assignments: v.assignments.filter((a) => a.assignmentId !== assignmentId),
      })),
    );
  }

  async function handleToggleCheckedIn(shiftId: string, assignment: PlanningAssignment) {
    const nextCheckedIn = !assignment.checkedInAt;

    setBusyKey(`checkin-${assignment.assignmentId}`);
    const result = await setAssignmentCheckedIn(assignment.assignmentId, nextCheckedIn);
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    updateBlock(shiftId, (block) => ({
      ...block,
      assignments: block.assignments.map((a) =>
        a.assignmentId === assignment.assignmentId
          ? { ...a, checkedInAt: result.data.checkedInAt }
          : a,
      ),
    }));
  }

  async function handleAddVolunteer(shift: PlanningShift, volunteer: VolunteerRow, force: boolean) {
    setBusyKey(`add-${shift.id}-${volunteer.id}`);
    const result = await addVolunteerToShift(shift.id, volunteer.id, { force });
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    updateBlock(shift.id, (block) => ({
      ...block,
      assignments: [
        ...block.assignments,
        {
          assignmentId: result.data.assignmentId,
          volunteerId: volunteer.id,
          volunteerName: volunteer.name,
          status: "pending" as const,
          checkedInAt: null,
        },
      ],
    }));

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
                  isTemplate: shift.isTemplate,
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

  const addVolunteerShift =
    groups.flatMap((g) => g.blocks).find((block) => block.id === addVolunteerShiftId) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold">Templates</h1>
      <p className="mt-1 text-slate-500">
        Shifts that were split into smaller blocks and combined into one
        worthwhile shift for a volunteer — meant to be accepted or declined
        as a whole. Each box below is one template.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by shift, location, lead or volunteer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-w-64 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <span className="shrink-0 text-sm text-slate-500">
          {filteredGroups.length} template{filteredGroups.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {filteredGroups.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
            No templates match the current search.
          </p>
        )}

        {filteredGroups.map((group) => {
          const totals = group.blocks.reduce(
            (acc, block) => ({
              assigned: acc.assigned + block.assignments.length,
              needed: acc.needed + block.volunteersNeeded,
            }),
            { assigned: 0, needed: 0 },
          );
          const first = group.blocks[0];
          const last = group.blocks[group.blocks.length - 1];

          return (
            <div
              key={group.key}
              className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Template · {group.blocks.length} blocks
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {formatShortDate(first.date)} · {first.startTime}
                    {first.date !== last.date && ` – ${formatShortDate(last.date)}`} –{" "}
                    {last.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>
                    {totals.assigned} / {totals.needed} assigned
                  </span>
                  <ProgressBar assigned={totals.assigned} needed={totals.needed} />
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                {group.blocks.map((block) => {
                  const style = roleStyle(block.roleCategory);
                  const openSpots = block.volunteersNeeded - block.assignments.length;

                  return (
                    <div
                      key={block.id}
                      className={`rounded-lg border bg-white p-3 ${style.cardClassName}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${style.badgeClassName}`}
                          >
                            <span>{style.emoji}</span>
                            {block.roleCategory}
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">{block.id}</span>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-slate-700">
                          {block.assignments.length} / {block.volunteersNeeded}
                        </span>
                      </div>

                      {block.shiftTitle && (
                        <p className="mt-1 text-xs font-semibold text-slate-700">
                          {block.shiftTitle}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                        <span>
                          {formatShortDate(block.date)} · {block.startTime}–{block.endTime} (
                          {block.hours}h)
                        </span>
                        <span>
                          {block.location}
                          {block.room && ` · ${block.room}`}
                        </span>
                      </div>

                      {block.shiftLead && (
                        <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-500">Shift lead</span>
                          {formatShiftLead(block.shiftLead)}
                        </div>
                      )}

                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {block.assignments.map((assignment) => (
                          <div
                            key={assignment.assignmentId}
                            className="flex flex-col gap-1 rounded-md bg-slate-50 px-2 py-1.5 text-xs"
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
                                onClick={() => handleRemoveVolunteer(block.id, assignment.assignmentId)}
                                disabled={busyKey === `remove-${assignment.assignmentId}`}
                                className="rounded bg-red-50 px-1.5 py-0.5 text-red-600 hover:bg-red-100 disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </div>
                            {assignment.status === "confirmed" && (
                              <button
                                type="button"
                                onClick={() => handleToggleCheckedIn(block.id, assignment)}
                                disabled={busyKey === `checkin-${assignment.assignmentId}`}
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
                          <div className="flex items-center rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-700">
                            {openSpots} open spot{openSpots === 1 ? "" : "s"}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setAddVolunteerShiftId(block.id)}
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
