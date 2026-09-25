"use client";

import { useMemo, useState } from "react";
import type { VolunteerRow, VolunteerAssignmentStatus } from "@/lib/adminVolunteers";
import type { ShiftDirectoryEntry } from "@/lib/adminPlanning";
import { addVolunteerToShift, createVolunteer, removeAssignment } from "@/lib/adminActions";
import { isVolunteerAvailableForShift, hasOverlap } from "@/lib/shiftEligibility";
import { Modal } from "@/components/Modal";
import { ROLE_STYLES, DEFAULT_ROLE_STYLE } from "@/lib/constants";

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

export function VolunteersBoard({
  initialVolunteers,
  shiftDirectory,
}: {
  initialVolunteers: VolunteerRow[];
  shiftDirectory: ShiftDirectoryEntry[];
}) {
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | VolunteerAssignmentStatus>("all");
  const [orgFilter, setOrgFilter] = useState("all");
  const [addVolunteerOpen, setAddVolunteerOpen] = useState(false);
  const [assignShiftVolunteerId, setAssignShiftVolunteerId] = useState<string | null>(null);
  const [assignShiftQuery, setAssignShiftQuery] = useState("");
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

      return true;
    });
  }, [volunteers, searchQuery, orgFilter, statusFilter]);

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
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

  async function handleAssignShift(volunteerId: string, shift: ShiftDirectoryEntry) {
    setBusyKey(`assign-${volunteerId}-${shift.id}`);
    const result = await addVolunteerToShift(shift.id, volunteerId);
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
        <button
          type="button"
          onClick={() => setAddVolunteerOpen(true)}
          className="shrink-0 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add volunteer
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

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Organization</th>
              <th className="px-4 py-3 font-medium"># Shifts</th>
              <th className="px-4 py-3 font-medium">Assigned shifts</th>
            </tr>
          </thead>
          <tbody>
            {filteredVolunteers.map((volunteer) => (
              <tr key={volunteer.id} className="border-b border-slate-50 align-top last:border-b-0">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{volunteer.id}</td>
                <td className="px-4 py-3 font-medium">{volunteer.name}</td>
                <td className="px-4 py-3 text-slate-500">{volunteer.email}</td>
                <td className="px-4 py-3 text-slate-500">{volunteer.association || "—"}</td>
                <td className="px-4 py-3">{volunteer.assignments.length}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    {volunteer.assignments.length === 0 && (
                      <span className="text-slate-400">No shifts assigned</span>
                    )}

                    {volunteer.assignments.map((assignment) => {
                      const style = ROLE_STYLES[assignment.roleCategory] ?? DEFAULT_ROLE_STYLE;

                      return (
                        <div
                          key={assignment.assignmentId}
                          className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5"
                        >
                          <span className="text-slate-600">
                            {formatDate(assignment.date)} · {assignment.startTime}–
                            {assignment.endTime}
                          </span>
                          <span className="text-slate-400">{assignment.location}</span>
                          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${style.badgeClassName}`}>
                            {assignment.roleCategory}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_STYLES[assignment.status]}`}
                          >
                            {assignment.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAssignment(volunteer.id, assignment.assignmentId)}
                            disabled={busyKey === `remove-${assignment.assignmentId}`}
                            className="ml-auto rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setAssignShiftVolunteerId(volunteer.id)}
                      className="self-start rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      + Add to shift
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredVolunteers.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">
            No volunteers match the current filters.
          </p>
        )}
      </div>

      {addVolunteerOpen && (
        <Modal onClose={() => setAddVolunteerOpen(false)}>
          <AddVolunteerForm
            onCancel={() => setAddVolunteerOpen(false)}
            onCreate={async (input) => {
              setBusyKey("create-volunteer");
              const result = await createVolunteer(input);
              setBusyKey(null);

              if (!result.ok) {
                setError(result.error);
                return;
              }

              setVolunteers((current) => [
                ...current,
                {
                  id: result.data.id,
                  name: `${input.firstName} ${input.lastName}`.trim(),
                  email: input.email,
                  association: input.association,
                  availability: [],
                  assignments: [],
                },
              ]);
              setAddVolunteerOpen(false);
            }}
            busy={busyKey === "create-volunteer"}
          />
        </Modal>
      )}

      {assignShiftVolunteer && (
        <Modal
          onClose={() => {
            setAssignShiftVolunteerId(null);
            setAssignShiftQuery("");
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">
              Add {assignShiftVolunteer.name} to a shift
            </h3>

            <input
              type="text"
              autoFocus
              placeholder="Search by location or shift type..."
              value={assignShiftQuery}
              onChange={(e) => setAssignShiftQuery(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />

            <p className="mt-1 text-xs text-slate-400">
              Only shifts this volunteer is available for and doesn&apos;t overlap with are shown.
            </p>

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
                  const activeShifts = assignShiftVolunteer.assignments
                    .filter((a) => a.status !== "cancelled")
                    .map((a) => ({ date: a.date, startTime: a.startTime, endTime: a.endTime }));

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
                    onClick={() => handleAssignShift(assignShiftVolunteer.id, shift)}
                    disabled={busyKey === `assign-${assignShiftVolunteer.id}-${shift.id}`}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    <span>
                      {formatDate(shift.date)} · {shift.startTime}–{shift.endTime}
                      <span className="ml-2 text-xs text-slate-400">
                        {shift.location} · {shift.roleCategory}
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

function AddVolunteerForm({
  onCancel,
  onCreate,
  busy,
}: {
  onCancel: () => void;
  onCreate: (input: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    association: string;
  }) => void;
  busy: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [association, setAssociation] = useState("");

  const isValid = firstName.trim() && lastName.trim() && email.trim();

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <h3 className="text-lg font-bold">Add volunteer</h3>

      <div className="mt-4 flex flex-col gap-3">
        <label className="text-sm">
          First name
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Last name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Phone number
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Organization (optional)
          <input
            type="text"
            value={association}
            onChange={(e) => setAssociation(e.target.value)}
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
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim(),
              phoneNumber: phoneNumber.trim(),
              association: association.trim(),
            })
          }
          className="flex-1 rounded-full bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Add volunteer
        </button>
      </div>
    </div>
  );
}
