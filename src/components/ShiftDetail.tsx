"use client";

import type { Shift, ShiftCrewMember } from "@/lib/shifts";
import { formatShiftDate, STATUS_LABELS, STATUS_STYLES } from "@/components/ShiftCard";
import { ROLE_STYLES, DEFAULT_ROLE_STYLE } from "@/lib/constants";

const MEETING_POINT = "Check in at the volunteer desk at your venue when you arrive.";
const BRING_ITEMS = "Comfortable shoes, your badge, and a charged phone.";
const MEET_BEFORE_MINUTES = 15;

function subtractMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const total = ((hours * 60 + mins - minutes) % (24 * 60) + 24 * 60) % (24 * 60);
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function IconSquare({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
      {children}
    </span>
  );
}

function MapPinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 21s-7-5.686-7-11a7 7 0 1 1 14 0c0 5.314-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function RoomIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 21v-5a3 3 0 0 1 6 0v5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6" />
    </svg>
  );
}

function CrewRow({ member }: { member: ShiftCrewMember }) {
  const revealed = member.isSelf || member.status === "confirmed";
  const displayName = member.isSelf ? "You" : member.name;
  const initials = member.isSelf ? "YOU" : initialsFor(member.name);

  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          member.isSelf ? "bg-blue-500 text-white" : "bg-white/10 text-white/70"
        } ${revealed ? "" : "blur-sm"}`}
      >
        {initials}
      </span>
      <span
        className={`flex-1 truncate text-sm font-medium text-white ${revealed ? "" : "select-none blur-sm"}`}
      >
        {displayName}
      </span>
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[member.status]}`}
      >
        {STATUS_LABELS[member.status]}
      </span>
    </div>
  );
}

export function ShiftDetail({
  shift,
  isUpdating,
  onAccept,
  onDecline,
  onClose,
}: {
  shift: Shift;
  isUpdating: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}) {
  const roleStyle = ROLE_STYLES[shift.shiftType] ?? DEFAULT_ROLE_STYLE;
  const sortedCrew = [...shift.crew].sort((a, b) =>
    a.isSelf === b.isSelf ? 0 : a.isSelf ? -1 : 1,
  );

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[#050A2B] text-white">
      <div className="mx-auto w-full max-w-2xl px-6 pt-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/15"
        >
          <span aria-hidden="true">&larr;</span>
        </button>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 pb-32 pt-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
          <span aria-hidden="true">{roleStyle.emoji}</span>
          {shift.shiftType}
        </span>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-bold">{shift.shiftTitle || shift.shiftType}</h1>
          {shift.shiftLead && (
            <span className="text-sm text-white/60">Shift lead: {shift.shiftLead}</span>
          )}
        </div>

        <span
          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs uppercase tracking-wide ${STATUS_STYLES[shift.status]}`}
        >
          {STATUS_LABELS[shift.status]}
        </span>

        <p className="mt-2 text-sm text-white/70">
          {formatShiftDate(shift.date)} · {shift.startTime}–{shift.endTime} ({shift.hours}h)
        </p>

        <div className="mt-6 rounded-2xl border border-white/15 bg-white/[0.06] p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <IconSquare>
                <MapPinIcon />
              </IconSquare>
              <div>
                <p className="text-xs text-white/50">Location</p>
                <p className="text-sm font-semibold">{shift.location}</p>
              </div>
            </div>
            {shift.room && (
              <div className="flex items-center gap-3">
                <IconSquare>
                  <RoomIcon />
                </IconSquare>
                <div>
                  <p className="text-xs text-white/50">Room</p>
                  <p className="text-sm font-semibold">{shift.room}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-cyan-500/10 p-3">
            <span className="mt-0.5 text-cyan-300">
              <ClockIcon />
            </span>
            <div>
              <p className="text-sm font-semibold text-cyan-100">
                Let&apos;s meet {MEET_BEFORE_MINUTES} min before!
              </p>
              <p className="mt-0.5 text-sm text-white/70">
                Be there at {subtractMinutes(shift.startTime, MEET_BEFORE_MINUTES)} so we can
                start on time at {shift.startTime}.
              </p>
            </div>
          </div>
        </div>

        {shift.extraInfo && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-white/60">
              What you&apos;ll do
            </h2>
            <p className="mt-3 text-sm text-white/80">{shift.extraInfo}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-4">
            <IconSquare>
              <MapPinIcon />
            </IconSquare>
            <div>
              <p className="text-sm font-semibold">Meeting point</p>
              <p className="mt-1 text-sm text-white/70">{MEETING_POINT}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-4">
            <IconSquare>
              <BagIcon />
            </IconSquare>
            <div>
              <p className="text-sm font-semibold">Bring</p>
              <p className="mt-1 text-sm text-white/70">{BRING_ITEMS}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-white/60">
              On this shift
            </h2>
            <span className="shrink-0 text-xs text-white/50">
              {shift.crew.length} volunteer{shift.crew.length === 1 ? "" : "s"}
            </span>
          </div>
          {sortedCrew.length > 1 && (
            <p className="mt-1 text-sm font-semibold text-white">Meet your shift crew</p>
          )}
          <div className="mt-3 flex flex-col gap-3">
            {sortedCrew.map((member, index) => (
              <CrewRow key={`${member.name}-${index}`} member={member} />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-white/15 bg-[#050A2B]">
        <div className="mx-auto w-full max-w-2xl px-6 py-6">
          {shift.status === "pending" ? (
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isUpdating}
                onClick={onAccept}
                className="flex-1 rounded-full bg-gradient-to-b from-[#2F5BFF] to-[#1137EA] border border-white/25 shadow-[0_0_28px_-8px_#1141E9] py-3 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={onDecline}
                aria-label="Decline shift"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 text-white/90 transition-colors hover:border-cyan-300/70 disabled:opacity-50"
              >
                <span aria-hidden="true" className="text-2xl leading-none">
                  &times;
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isUpdating}
              onClick={onDecline}
              className="w-full rounded-full border border-white/25 py-3 text-sm font-semibold text-white/90 transition-colors hover:border-red-300/60 hover:text-red-200 disabled:opacity-50"
            >
              Cancel shift
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
