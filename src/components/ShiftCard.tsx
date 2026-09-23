import type { Shift } from "@/lib/shifts";

function formatShiftDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const STATUS_STYLES = {
  pending: "bg-blue-500/20 text-blue-200",
  confirmed: "bg-green-500/20 text-green-300",
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
};

export function ShiftCard({
  shift,
  isUpdating,
  onAccept,
  onDecline,
}: {
  shift: Shift;
  isUpdating: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="rounded-2xl border border-blue-400/20 bg-blue-950/20 p-5 text-white">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">
          {formatShiftDate(shift.date)} · {shift.startTime} –{" "}
          {shift.endTime} ({shift.hours}h)
        </span>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs uppercase tracking-wide ${STATUS_STYLES[shift.status]}`}
        >
          {STATUS_LABELS[shift.status]}
        </span>
      </div>
      <p className="mt-1 text-sm text-blue-100/70">
        {shift.location} · {shift.shiftType}
      </p>

      {shift.status === "pending" && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={isUpdating}
            onClick={onAccept}
            className="flex-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-2 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
          >
            Accept
          </button>
          <button
            type="button"
            disabled={isUpdating}
            onClick={onDecline}
            className="flex-1 rounded-full border border-blue-400/40 py-2 text-sm font-semibold text-blue-100 transition-colors hover:border-blue-300/70 disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
