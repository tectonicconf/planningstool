"use client";

import { useMemo, useState, useTransition } from "react";
import { sendBulkEmail } from "@/lib/adminActions";
import { Modal } from "@/components/Modal";
import { ROLE_CATEGORIES, ROLE_STYLES, DEFAULT_ROLE_STYLE } from "@/lib/constants";
import type { MailShift, MailRecipient } from "@/lib/adminMail";

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

export function MailBoard({
  shifts,
  volunteers,
}: {
  shifts: MailShift[];
  volunteers: MailRecipient[];
}) {
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selectedShiftIds, setSelectedShiftIds] = useState<Set<string>>(new Set());
  // Someone added outside of a shift selection (manuallyAdded) and someone
  // taken out of the list even though a selected shift would otherwise bring
  // them back in (manuallyRemoved) — kept separate from selectedShiftIds so
  // the recipient list stays fully derived instead of drifting out of sync
  // with which shifts are checked.
  const [manuallyAdded, setManuallyAdded] = useState<Map<string, MailRecipient>>(new Map());
  const [manuallyRemoved, setManuallyRemoved] = useState<Set<string>>(new Set());
  const [addQuery, setAddQuery] = useState("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSending, startSending] = useTransition();
  const [result, setResult] = useState<{ sentCount: number; failedEmails: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const knownDates = useMemo(() => distinctSorted(shifts.map((s) => s.date)), [shifts]);

  const filteredShifts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shifts
      .filter((s) => dateFilter === "all" || s.date === dateFilter)
      .filter((s) => roleFilter === "all" || s.roleCategory === roleFilter)
      .filter((s) => {
        if (!q) return true;
        return (
          s.id.toLowerCase().includes(q) ||
          s.shiftTitle.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.room.toLowerCase().includes(q) ||
          s.roleCategory.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  }, [shifts, query, dateFilter, roleFilter]);

  const recipients = useMemo(() => {
    const map = new Map<string, MailRecipient>();
    for (const shift of shifts) {
      if (!selectedShiftIds.has(shift.id)) continue;
      for (const r of shift.recipients) {
        if (!manuallyRemoved.has(r.volunteerId)) map.set(r.volunteerId, r);
      }
    }
    for (const r of manuallyAdded.values()) map.set(r.volunteerId, r);
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [shifts, selectedShiftIds, manuallyAdded, manuallyRemoved]);

  const recipientIds = useMemo(() => new Set(recipients.map((r) => r.volunteerId)), [recipients]);

  const addCandidates = useMemo(() => {
    const q = addQuery.trim().toLowerCase();
    if (!q) return [];
    return volunteers
      .filter((v) => !recipientIds.has(v.volunteerId))
      .filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.email.toLowerCase().includes(q) ||
          v.volunteerId.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [volunteers, addQuery, recipientIds]);

  function toggleShift(shift: MailShift) {
    setSelectedShiftIds((prev) => {
      const next = new Set(prev);
      if (next.has(shift.id)) {
        next.delete(shift.id);
      } else {
        next.add(shift.id);
        // Re-selecting a shift wins over an earlier manual removal of its
        // people — an explicit "add this shift" click should actually add them.
        setManuallyRemoved((removed) => {
          if (shift.recipients.every((r) => !removed.has(r.volunteerId))) return removed;
          const nextRemoved = new Set(removed);
          for (const r of shift.recipients) nextRemoved.delete(r.volunteerId);
          return nextRemoved;
        });
      }
      return next;
    });
  }

  function removeRecipient(id: string) {
    setManuallyAdded((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
    setManuallyRemoved((prev) => new Set(prev).add(id));
  }

  function addRecipient(volunteer: MailRecipient) {
    setManuallyAdded((prev) => new Map(prev).set(volunteer.volunteerId, volunteer));
    setManuallyRemoved((prev) => {
      if (!prev.has(volunteer.volunteerId)) return prev;
      const next = new Set(prev);
      next.delete(volunteer.volunteerId);
      return next;
    });
    setAddQuery("");
  }

  function clearRecipients() {
    setSelectedShiftIds(new Set());
    setManuallyAdded(new Map());
    setManuallyRemoved(new Set());
  }

  function handleSend() {
    setError(null);
    startSending(async () => {
      const sendResult = await sendBulkEmail({
        recipients: recipients.map((r) => ({ email: r.email })),
        subject,
        body,
      });

      setConfirmOpen(false);

      if (!sendResult.ok) {
        setError(sendResult.error);
        return;
      }

      setResult(sendResult.data);
      setSubject("");
      setBody("");
    });
  }

  const canSend = recipients.length > 0 && subject.trim().length > 0 && body.trim().length > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold">Mail</h1>
      <p className="mt-1 text-slate-500">
        Select shifts to pull in everyone assigned to them, fine-tune the recipient list, and
        send a one-off email via Resend.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {result && (
        <p className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Sent to {result.sentCount} {result.sentCount === 1 ? "person" : "people"}.
          {result.failedEmails.length > 0 && (
            <> Failed for: {result.failedEmails.join(", ")}.</>
          )}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Select shifts</h2>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search by shift name, shift ID, location or type"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-64 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />

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
          </div>

          <div className="mt-3 max-h-[32rem] space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
            {filteredShifts.length === 0 && (
              <p className="px-2 py-4 text-sm text-slate-400">No shifts match these filters.</p>
            )}

            {filteredShifts.map((shift) => {
              const isSelected = selectedShiftIds.has(shift.id);
              const style = roleStyle(shift.roleCategory);

              return (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => toggleShift(shift)}
                  className={`flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm ${
                    isSelected
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input type="checkbox" readOnly checked={isSelected} className="mt-1" />
                    <div>
                      <p className="flex items-center gap-2 font-medium text-slate-800">
                        {shift.shiftTitle || shift.roleCategory}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.badgeClassName}`}
                        >
                          {shift.roleCategory}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatShortDate(shift.date)}, {shift.startTime}–{shift.endTime} ·{" "}
                        {locationLabel(shift.location, shift.room)}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-slate-500">
                    {shift.recipients.length} assigned
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Recipients ({recipients.length})
            </h2>
            {recipients.length > 0 && (
              <button
                type="button"
                onClick={clearRecipients}
                className="text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="relative mt-3">
            <input
              type="text"
              placeholder="Add someone by name, email or volunteer ID..."
              value={addQuery}
              onChange={(e) => setAddQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            {addCandidates.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                {addCandidates.map((v) => (
                  <button
                    key={v.volunteerId}
                    type="button"
                    onClick={() => addRecipient(v)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="truncate">{v.name}</span>
                    <span className="shrink-0 truncate text-xs text-slate-400">{v.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
            {recipients.length === 0 && (
              <p className="px-2 py-4 text-sm text-slate-400">
                No recipients yet — select a shift or add someone above.
              </p>
            )}

            {recipients.map((r) => (
              <div
                key={r.volunteerId}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">{r.name}</p>
                  <p className="truncate text-xs text-slate-500">{r.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeRecipient(r.volunteerId)}
                  aria-label={`Remove ${r.name}`}
                  className="shrink-0 rounded-full px-2 py-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <h2 className="mt-6 text-sm font-semibold text-slate-700">Compose</h2>

          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />

          <textarea
            placeholder="Write your email..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />

          <button
            type="button"
            disabled={!canSend}
            onClick={() => setConfirmOpen(true)}
            className="mt-3 w-full rounded-full bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send to {recipients.length} {recipients.length === 1 ? "person" : "people"}
          </button>
        </div>
      </div>

      {confirmOpen && (
        <Modal onClose={() => (isSending ? undefined : setConfirmOpen(false))}>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">Send this email?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This will send &ldquo;<span className="font-semibold">{subject}</span>&rdquo; to{" "}
              <span className="font-semibold">{recipients.length}</span>{" "}
              {recipients.length === 1 ? "person" : "people"}. This can&apos;t be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={isSending}
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-full border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={handleSend}
                className="flex-1 rounded-full bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
