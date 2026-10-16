"use client";

import { useMemo, useState } from "react";
import type { VolunteerRow, VolunteerAssignmentStatus } from "@/lib/adminVolunteers";
import type { ShiftDirectoryEntry } from "@/lib/adminPlanning";
import {
  addVolunteerToShift,
  createVolunteer,
  removeAssignment,
  setAssignmentCheckedIn,
  type ActionResult,
} from "@/lib/adminActions";
import {
  isVolunteerAvailableForShift,
  hasOverlap,
  hasReachedShiftPreference,
  resolveAvailabilityEntry,
  isAvailabilitySlotOccupied,
} from "@/lib/shiftEligibility";
import { Modal } from "@/components/Modal";
import {
  ROLE_STYLES,
  DEFAULT_ROLE_STYLE,
  ROLE_CATEGORIES,
  SHIFT_COUNT_PREFERENCES,
  AVAILABILITY_OPTIONS,
  availabilityValue,
} from "@/lib/constants";

// AVAILABILITY_OPTIONS already has a nice label for every (date, slot) —
// used to display a short-form entry ("2026-10-20 Morning", from a
// manually-added volunteer) the same way as a label-form one.
const labelByDateSlot = new Map(
  AVAILABILITY_OPTIONS.map((option) => [`${option.date} ${option.slot}`, option.label]),
);

function isAvailabilityOccupied(
  volunteer: VolunteerRow,
  date: string,
  slot: string,
): boolean {
  const activeAssignments = volunteer.assignments.filter((a) => a.status !== "cancelled");
  return isAvailabilitySlotOccupied(activeAssignments, date, slot);
}

function volunteerHasOpenAvailability(volunteer: VolunteerRow): boolean {
  return volunteer.availability.some((raw) => {
    const resolved = resolveAvailabilityEntry(raw);
    return resolved ? !isAvailabilityOccupied(volunteer, resolved.date, resolved.slot) : false;
  });
}

// Flat, uniform color — occupied-vs-open used to also be shown here via a
// strikethrough, but that's already visible from the assignment list right
// next to it, so marking it a second time on these badges was redundant and
// read as a confusing second meaning for color/styling on the same card.
function AvailabilityBadges({ volunteer }: { volunteer: VolunteerRow }) {
  if (volunteer.availability.length === 0) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {volunteer.availability.map((raw) => {
        const resolved = resolveAvailabilityEntry(raw);
        const label = resolved
          ? (labelByDateSlot.get(`${resolved.date} ${resolved.slot}`) ?? raw)
          : raw;

        return (
          <span
            key={raw}
            className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700"
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

// Same layout as AvailabilityBadges, but colored per shift type (the same
// ROLE_STYLES used on Planning/Timeline) so a preference badge reads as
// "this role category", not as another occupied/open signal.
function ShiftPreferenceBadges({ volunteer }: { volunteer: VolunteerRow }) {
  if (volunteer.shiftPreferences.length === 0) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {volunteer.shiftPreferences.map((role) => {
        const style = ROLE_STYLES[role] ?? DEFAULT_ROLE_STYLE;

        return (
          <span
            key={role}
            className={`rounded px-1.5 py-0.5 text-xs font-medium ${style.badgeClassName}`}
          >
            {role}
          </span>
        );
      })}
    </div>
  );
}

const STATUS_STYLES: Record<VolunteerAssignmentStatus, string> = {
  pending: "bg-blue-100 text-blue-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function VolunteerAssignmentsList({
  volunteer,
  busyKey,
  onToggleCheckedIn,
  onRemove,
  onAddToShift,
  readOnly = false,
}: {
  volunteer: VolunteerRow;
  busyKey: string | null;
  onToggleCheckedIn: (assignment: VolunteerRow["assignments"][number]) => void;
  onRemove: (assignmentId: number) => void;
  onAddToShift: () => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {volunteer.assignments.length === 0 && (
        <span className="text-slate-400">No shifts assigned</span>
      )}

      {volunteer.assignments.map((assignment) => {
        const style = ROLE_STYLES[assignment.roleCategory] ?? DEFAULT_ROLE_STYLE;

        return (
          <div
            key={assignment.assignmentId}
            className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5"
          >
            {assignment.shiftTitle && (
              <p className="text-xs font-semibold text-slate-700">{assignment.shiftTitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-600">
                {formatDate(assignment.date)} · {assignment.startTime}–
                {assignment.endTime}
                {assignment.endDate !== assignment.date && (
                  <span
                    title={`Ends ${assignment.endDate}`}
                    className="ml-1 align-top text-[10px] font-semibold text-amber-600"
                  >
                    +1d
                  </span>
                )}
              </span>
              <span className="text-slate-400">
                {assignment.location}
                {assignment.room && ` · ${assignment.room}`}
              </span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${style.badgeClassName}`}>
                {assignment.roleCategory}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_STYLES[assignment.status]}`}
              >
                {assignment.status}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onRemove(assignment.assignmentId)}
                  disabled={busyKey === `remove-${assignment.assignmentId}`}
                  className="ml-auto rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
            {assignment.shiftLead && (
              <div className="inline-flex w-fit items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-500">Shift lead</span>
                {assignment.shiftLead}
              </div>
            )}
            {assignment.status === "confirmed" &&
              (readOnly ? (
                <span
                  className={`w-full rounded px-2 py-1 text-center text-xs font-medium ${
                    assignment.checkedInAt
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {assignment.checkedInAt ? "Checked in ✓" : "Not checked in"}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggleCheckedIn(assignment)}
                  disabled={busyKey === `checkin-${assignment.assignmentId}`}
                  title={
                    assignment.checkedInAt
                      ? `Checked in at ${new Date(assignment.checkedInAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                      : "Mark as checked in"
                  }
                  className={`w-full rounded px-2 py-1 text-center text-xs font-medium disabled:opacity-50 ${
                    assignment.checkedInAt
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {assignment.checkedInAt ? "Checked in ✓" : "Check in"}
                </button>
              ))}
          </div>
        );
      })}

      {!readOnly && (
        <button
          type="button"
          onClick={onAddToShift}
          className="self-start rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          + Add to shift
        </button>
      )}
    </div>
  );
}

export function VolunteersBoard({
  initialVolunteers,
  shiftDirectory,
  initialSearch = "",
  readOnly = false,
}: {
  initialVolunteers: VolunteerRow[];
  shiftDirectory: ShiftDirectoryEntry[];
  initialSearch?: string;
  readOnly?: boolean;
}) {
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<"all" | VolunteerAssignmentStatus>("all");
  const [orgFilter, setOrgFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "open">("all");
  const [addVolunteerOpen, setAddVolunteerOpen] = useState(false);
  const [assignShiftVolunteerId, setAssignShiftVolunteerId] = useState<string | null>(null);
  const [assignShiftQuery, setAssignShiftQuery] = useState("");
  const [assignShiftOverride, setAssignShiftOverride] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const organizations = useMemo(
    () =>
      Array.from(new Set(volunteers.map((v) => v.association).filter(Boolean))).sort(),
    [volunteers],
  );

  const filteredVolunteers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return volunteers.filter((volunteer) => {
      if (
        query &&
        !volunteer.name.toLowerCase().includes(query) &&
        !volunteer.email.toLowerCase().includes(query) &&
        !volunteer.id.toLowerCase().includes(query)
      )
        return false;

      if (orgFilter !== "all") {
        if (orgFilter === "none" && volunteer.association) return false;
        if (orgFilter !== "none" && volunteer.association !== orgFilter) return false;
      }

      if (statusFilter !== "all" && !volunteer.assignments.some((a) => a.status === statusFilter))
        return false;

      if (availabilityFilter === "open" && !volunteerHasOpenAvailability(volunteer))
        return false;

      return true;
    });
  }, [volunteers, searchQuery, orgFilter, statusFilter, availabilityFilter]);

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setAvailabilityFilter("all");
    setOrgFilter("all");
  }

  async function handleRemoveAssignment(volunteerId: string, assignmentId: number) {
    setBusyKey(`remove-${assignmentId}`);
    const result = await removeAssignment(assignmentId);
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setVolunteers((current) =>
      current.map((v) =>
        v.id === volunteerId
          ? { ...v, assignments: v.assignments.filter((a) => a.assignmentId !== assignmentId) }
          : v,
      ),
    );
  }

  async function handleToggleCheckedIn(
    volunteerId: string,
    assignment: VolunteerRow["assignments"][number],
  ) {
    const nextCheckedIn = !assignment.checkedInAt;

    setBusyKey(`checkin-${assignment.assignmentId}`);
    const result = await setAssignmentCheckedIn(
      assignment.assignmentId,
      nextCheckedIn,
    );
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setVolunteers((current) =>
      current.map((v) =>
        v.id === volunteerId
          ? {
              ...v,
              assignments: v.assignments.map((a) =>
                a.assignmentId === assignment.assignmentId
                  ? { ...a, checkedInAt: result.data.checkedInAt }
                  : a,
              ),
            }
          : v,
      ),
    );
  }

  async function handleAssignShift(
    volunteerId: string,
    shift: ShiftDirectoryEntry,
    force: boolean,
  ) {
    setBusyKey(`assign-${volunteerId}-${shift.id}`);
    const result = await addVolunteerToShift(shift.id, volunteerId, { force });
    setBusyKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setVolunteers((current) =>
      current.map((v) =>
        v.id === volunteerId
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
    setAssignShiftVolunteerId(null);
    setAssignShiftQuery("");
  }

  const assignShiftVolunteer = volunteers.find((v) => v.id === assignShiftVolunteerId) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Volunteers</h1>
          <p className="mt-1 text-slate-500">
            View all volunteers and their assigned shifts. Add or remove
            volunteers from shifts.
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setAddVolunteerOpen(true)}
            className="shrink-0 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Add volunteer
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, email or volunteer ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-w-64 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | VolunteerAssignmentStatus)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All organizations</option>
          <option value="none">Unaffiliated</option>
          {organizations.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>

        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value as "all" | "open")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Any availability</option>
          <option value="open">Still available</option>
        </select>

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Clear filters
        </button>

        <span className="ml-auto text-sm text-slate-500">
          {filteredVolunteers.length} volunteers
        </span>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-400" /> blue = availability
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-400" /> colored = shift-type
          preference (same colors as Planning/Timeline)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-400" /> orange = already at
          their preferred shift count — try not to assign more
        </span>
      </p>

      {/* One card layout at every screen size (avoids a wide table that
          doesn't fit well on any screen) — info on the left, shifts on the
          right once there's room for two columns, stacked below that. */}
      <div className="mt-4 flex flex-col gap-3">
        {filteredVolunteers.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
            No volunteers match the current filters.
          </p>
        ) : (
          filteredVolunteers.map((volunteer) => (
            <div key={volunteer.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{volunteer.name}</p>
                      <p className="font-mono text-xs text-slate-400">{volunteer.id}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">
                      {volunteer.assignments.length} shift{volunteer.assignments.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    <dt className="text-slate-400">Email</dt>
                    <dd className="truncate text-slate-600">{volunteer.email}</dd>
                    <dt className="text-slate-400">Phone</dt>
                    <dd className="text-slate-600">{volunteer.phoneNumber || "—"}</dd>
                    <dt className="text-slate-400">Token</dt>
                    <dd className="truncate font-mono text-xs text-slate-400" title={volunteer.magicLinkToken}>
                      {volunteer.magicLinkToken}
                    </dd>
                    <dt className="text-slate-400">Org</dt>
                    <dd className="text-slate-600">{volunteer.association || "—"}</dd>
                    <dt className="text-slate-400">Shift preference</dt>
                    <dd className="flex items-center gap-1.5 text-slate-600">
                      {volunteer.shiftCountPreference || "—"}
                      {hasReachedShiftPreference(volunteer) && (
                        <span
                          title="Already at their preferred shift count — try not to assign more"
                          className="h-2 w-2 shrink-0 rounded-full bg-orange-400"
                        />
                      )}
                    </dd>
                    <dt className="text-slate-400">T-shirt size</dt>
                    <dd className="text-slate-600">{volunteer.shirtSize || "—"}</dd>
                    <dt className="text-slate-400">Quiz</dt>
                    <dd>
                      {volunteer.quizCompleted ? (
                        <span className="text-emerald-600">✓ Completed</span>
                      ) : (
                        <span className="text-red-500">✕ Not completed</span>
                      )}
                    </dd>
                    <dt className="text-slate-400">Emergency contact</dt>
                    <dd className="text-slate-600">
                      {volunteer.emergencyContactName || volunteer.emergencyPhone ? (
                        <div className="flex flex-col">
                          <span>{volunteer.emergencyContactName || "—"}</span>
                          <span className="text-slate-500">{volunteer.emergencyPhone || "—"}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </dl>

                  <div className="mt-3">
                    <p className="mb-1 text-xs font-medium text-slate-400">Availability</p>
                    <AvailabilityBadges volunteer={volunteer} />
                  </div>

                  <div className="mt-3">
                    <p className="mb-1 text-xs font-medium text-slate-400">Shift preference</p>
                    <ShiftPreferenceBadges volunteer={volunteer} />
                  </div>
                </div>

                <div className="min-w-0">
                  <VolunteerAssignmentsList
                    volunteer={volunteer}
                    busyKey={busyKey}
                    onToggleCheckedIn={(assignment) => handleToggleCheckedIn(volunteer.id, assignment)}
                    onRemove={(assignmentId) => handleRemoveAssignment(volunteer.id, assignmentId)}
                    onAddToShift={() => setAssignShiftVolunteerId(volunteer.id)}
                    readOnly={readOnly}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!readOnly && addVolunteerOpen && (
        <Modal onClose={() => setAddVolunteerOpen(false)}>
          <AddVolunteerForm
            onCancel={() => setAddVolunteerOpen(false)}
            onSubmit={async (input) => {
              const result = await createVolunteer(input);

              if (result.ok) {
                setVolunteers((current) => [
                  ...current,
                  {
                    id: result.data.id,
                    name: `${input.firstName} ${input.lastName}`.trim(),
                    email: input.email,
                    phoneNumber: input.phoneNumber.replace(/[\s+]/g, ""),
                    association: input.association,
                    availability: input.availability,
                    shiftPreferences: input.shiftPreferences,
                    magicLinkToken: result.data.magicLinkToken,
                    shiftCountPreference: input.shiftCountPreference,
                    quizCompleted: false,
                    shirtSize: "",
                    emergencyContactName: "",
                    emergencyPhone: "",
                    assignments: [],
                  },
                ]);
                setAddVolunteerOpen(false);
              }

              return result;
            }}
          />
        </Modal>
      )}

      {!readOnly && assignShiftVolunteer && (
        <Modal
          onClose={() => {
            setAssignShiftVolunteerId(null);
            setAssignShiftQuery("");
            setAssignShiftOverride(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold">
                Add {assignShiftVolunteer.name} to a shift
              </h3>
              <button
                type="button"
                onClick={() => setAssignShiftOverride((current) => !current)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  assignShiftOverride
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {assignShiftOverride ? "Override: on" : "Override"}
              </button>
            </div>

            <input
              type="text"
              autoFocus
              placeholder="Search by location or shift type..."
              value={assignShiftQuery}
              onChange={(e) => setAssignShiftQuery(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />

            {assignShiftOverride ? (
              <p className="mt-1 rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">
                Override is on — every shift is shown, including ones this
                volunteer isn&apos;t available for or that overlap another shift.
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                Only shifts this volunteer is available for and doesn&apos;t overlap with are shown.
              </p>
            )}

            {hasReachedShiftPreference(assignShiftVolunteer) && (
              <p className="mt-2 rounded-lg bg-orange-50 px-2 py-1.5 text-xs text-orange-700">
                Already has their preferred number of shifts ({assignShiftVolunteer.shiftCountPreference}) — try not to assign more unless necessary.
              </p>
            )}

            <div className="mt-3 max-h-64 overflow-y-auto">
              {shiftDirectory
                .filter((shift) => {
                  const query = assignShiftQuery.trim().toLowerCase();
                  if (!query) return true;
                  return (
                    shift.location.toLowerCase().includes(query) ||
                    shift.roleCategory.toLowerCase().includes(query)
                  );
                })
                .filter(
                  (shift) =>
                    !assignShiftVolunteer.assignments.some(
                      (a) => a.shiftId === shift.id && a.status !== "cancelled",
                    ),
                )
                .filter((shift) => {
                  if (assignShiftOverride) return true;

                  const activeShifts = assignShiftVolunteer.assignments
                    .filter((a) => a.status !== "cancelled")
                    .map((a) => ({
                      date: a.date,
                      endDate: a.endDate,
                      startTime: a.startTime,
                      endTime: a.endTime,
                    }));

                  return (
                    isVolunteerAvailableForShift(assignShiftVolunteer.availability, shift) &&
                    !hasOverlap(shift, activeShifts)
                  );
                })
                .slice(0, 30)
                .map((shift) => (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={() =>
                      handleAssignShift(assignShiftVolunteer.id, shift, assignShiftOverride)
                    }
                    disabled={busyKey === `assign-${assignShiftVolunteer.id}-${shift.id}`}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm disabled:opacity-50 ${
                      hasReachedShiftPreference(assignShiftVolunteer)
                        ? "bg-orange-50 hover:bg-orange-100"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span>
                      {shift.shiftTitle && (
                        <span className="mr-1 font-semibold text-slate-700">
                          {shift.shiftTitle}
                        </span>
                      )}
                      {formatDate(shift.date)} · {shift.startTime}–{shift.endTime}
                      <span className="ml-2 text-xs text-slate-400">
                        {shift.location}
                        {shift.room && ` · ${shift.room}`} · {shift.roleCategory}
                      </span>
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

type CreateVolunteerInput = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  association: string;
  shiftPreferences: string[];
  availability: string[];
  shiftCountPreference: string;
};

function toggleInArray(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function AddVolunteerForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (
    input: CreateVolunteerInput,
  ) => Promise<ActionResult<{ id: string; magicLinkToken: string }>>;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [association, setAssociation] = useState("");
  const [shiftPreferences, setShiftPreferences] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [shiftCountPreference, setShiftCountPreference] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isValid = firstName.trim() && lastName.trim() && email.trim();

  function resetFields() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setAssociation("");
    setShiftPreferences([]);
    setAvailability([]);
    setShiftCountPreference("");
  }

  async function handleSubmit() {
    setBusy(true);
    setFormError(null);

    const result = await onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      association: association.trim(),
      shiftPreferences,
      availability,
      shiftCountPreference,
    });

    setBusy(false);

    if (!result.ok) {
      setFormError(result.error);
      resetFields();
    }
  }

  return (
    <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <h3 className="text-lg font-bold">Add volunteer</h3>

      {formError && (
        <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <label className="text-sm">
          First name
          <input
            type="text"
            placeholder="e.g. Nina"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Last name
          <input
            type="text"
            placeholder="e.g. Jacobs"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Email
          <input
            type="email"
            placeholder="e.g. nina.jacobs@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Phone number
          <input
            type="tel"
            placeholder="+324XXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Organization (optional)
          <input
            type="text"
            placeholder="e.g. AIESEC Ghent"
            value={association}
            onChange={(e) => setAssociation(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          Number of shifts
          <select
            value={shiftCountPreference}
            onChange={(e) => setShiftCountPreference(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="">Select a preference...</option>
            {SHIFT_COUNT_PREFERENCES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="text-sm">
          <p>Shift preferences (optional)</p>
          <div className="mt-1 flex flex-col gap-1 rounded-lg border border-slate-200 p-2">
            {ROLE_CATEGORIES.map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={shiftPreferences.includes(role)}
                  onChange={() => setShiftPreferences((current) => toggleInArray(current, role))}
                />
                {role}
              </label>
            ))}
          </div>
        </div>

        <div className="text-sm">
          <p>Availability (optional)</p>
          <div className="mt-1 flex flex-col gap-1 rounded-lg border border-slate-200 p-2">
            {AVAILABILITY_OPTIONS.map((option) => {
              const value = availabilityValue(option.date, option.slot);

              return (
                <label key={value} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={availability.includes(value)}
                    onChange={() => setAvailability((current) => toggleInArray(current, value))}
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </div>
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
          onClick={handleSubmit}
          className="flex-1 rounded-full bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Add volunteer
        </button>
      </div>
    </div>
  );
}
