import type { Shift } from "@/lib/shifts";

export function ShiftCard({ shift }: { shift: Shift }) {
  return (
    <div className="rounded-2xl border border-blue-400/20 bg-blue-950/20 p-5 text-white">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{shift.date}</span>
        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs uppercase tracking-wide">
          {shift.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-blue-100/70">
        {shift.startTime} – {shift.endTime} ({shift.hours}h)
      </p>
      <p className="mt-1 text-sm text-blue-100/70">
        {shift.location} · {shift.shiftType}
      </p>
    </div>
  );
}
