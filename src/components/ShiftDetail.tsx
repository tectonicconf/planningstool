"use client";

import type { Shift } from "@/lib/shifts";
import { formatShiftDate, STATUS_LABELS, STATUS_STYLES } from "@/components/ShiftCard";

const ROLE_CATEGORY_TASKS: Record<string, string[]> = {
  "Setup & Logistics": [
    "Help set up and break down spaces",
    "Move materials and manage supplies",
    "Support other teams wherever needed",
  ],
  "Stage & Session Support": [
    "Support stages and workshops",
    "Welcome speakers and keep track of timing",
    "Help handle microphones",
  ],
  "Guest Flow & Stewarding": [
    "Manage entrances, queues and room capacity",
    "Guide visitors to the right locations",
    "Help keep crowd flow safe and smooth",
  ],
  "Info & Welcome": [
    "Welcome visitors as they arrive",
    "Answer questions about the programme and venue",
    "Point people to the right place",
  ],
  "Food & Drinks": [
    "Support catering and bar areas",
    "Serve and refill food & drinks",
    "Keep service areas tidy",
  ],
  "Runner & Flexible Support": [
    "Help with ad-hoc tasks across the event",
    "Move materials between areas",
    "Jump in wherever extra support is needed",
  ],
  "Technical Support": [
    "Help with screens and presentations",
    "Support microphones and AV equipment",
    "Assist with basic troubleshooting",
  ],
};

const MEETING_POINT = "Check in at the volunteer desk at your venue when you arrive.";
const BRING_ITEMS = "Comfortable shoes, your badge, and a charged phone.";

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
  const tasks = ROLE_CATEGORY_TASKS[shift.shiftType] ?? [];

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[#050822] text-white">
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
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs uppercase tracking-wide ${STATUS_STYLES[shift.status]}`}
        >
          {STATUS_LABELS[shift.status]}
        </span>

        <h1 className="mt-4 text-2xl font-bold">{shift.shiftType}</h1>
        <p className="mt-1 text-sm text-blue-100/70">
          {formatShiftDate(shift.date)} · {shift.startTime}–{shift.endTime} ·{" "}
          {shift.location}
        </p>

        {tasks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-blue-200/60">
              What you&apos;ll do
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-blue-100/80">
              {tasks.map((task) => (
                <li key={task} className="flex gap-2">
                  <span aria-hidden="true">&bull;</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-xl border border-blue-400/20 bg-blue-950/30 p-4">
            <IconSquare>
              <MapPinIcon />
            </IconSquare>
            <div>
              <p className="text-sm font-semibold">Meeting point</p>
              <p className="mt-1 text-sm text-blue-100/70">{MEETING_POINT}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-blue-400/20 bg-blue-950/30 p-4">
            <IconSquare>
              <BagIcon />
            </IconSquare>
            <div>
              <p className="text-sm font-semibold">Bring</p>
              <p className="mt-1 text-sm text-blue-100/70">{BRING_ITEMS}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-blue-400/20 bg-[#050822]">
        <div className="mx-auto w-full max-w-2xl px-6 py-6">
          {shift.status === "pending" ? (
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isUpdating}
                onClick={onAccept}
                className="flex-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-3 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={onDecline}
                aria-label="Decline shift"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-400/40 text-blue-100 transition-colors hover:border-blue-300/70 disabled:opacity-50"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isUpdating}
              onClick={onDecline}
              className="w-full rounded-full border border-blue-400/40 py-3 text-sm font-semibold text-blue-100 transition-colors hover:border-red-300/60 hover:text-red-200 disabled:opacity-50"
            >
              Cancel shift
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
