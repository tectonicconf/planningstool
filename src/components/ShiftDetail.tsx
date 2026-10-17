"use client";

import type { Shift } from "@/lib/shifts";
import { formatShiftDate, STATUS_LABELS, STATUS_STYLES } from "@/components/ShiftCard";
import { ROLE_STYLES, DEFAULT_ROLE_STYLE } from "@/lib/constants";
import { ShiftBlockBody } from "@/components/ShiftBlockBody";
import { formatShiftLead } from "@/lib/shiftLead";

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
            <span className="text-sm text-white/60">
              Shift lead: {formatShiftLead(shift.shiftLead)}
            </span>
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
        {shift.eventContext && (
          <p className="mt-0.5 text-xs text-cyan-300/80">{shift.eventContext}</p>
        )}

        <div className="mt-6">
          <ShiftBlockBody shift={shift} />
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
