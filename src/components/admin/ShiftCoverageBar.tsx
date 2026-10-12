import type { ShiftCoverageStats } from "@/lib/adminActivity";

const SEGMENTS: {
  key: keyof Omit<ShiftCoverageStats, "totalNeeded">;
  label: string;
  barClassName: string;
  dotClassName: string;
}[] = [
  { key: "confirmed", label: "Confirmed", barClassName: "bg-emerald-500", dotClassName: "bg-emerald-500" },
  { key: "pending", label: "Pending", barClassName: "bg-blue-500", dotClassName: "bg-blue-500" },
  { key: "open", label: "Not assigned", barClassName: "bg-amber-400", dotClassName: "bg-amber-400" },
];

export function ShiftCoverageBar({ stats }: { stats: ShiftCoverageStats }) {
  const { totalNeeded } = stats;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Shift coverage
        </h2>
        <span className="text-xs text-slate-400">{totalNeeded} total spots</span>
      </div>

      <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {SEGMENTS.map((segment) => {
          const value = stats[segment.key];
          const pct = totalNeeded > 0 ? (value / totalNeeded) * 100 : 0;

          return pct > 0 ? (
            <div
              key={segment.key}
              className={segment.barClassName}
              style={{ width: `${pct}%` }}
              title={`${segment.label}: ${value}`}
            />
          ) : null;
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {SEGMENTS.map((segment) => (
          <span key={segment.key} className="flex items-center gap-1.5 text-slate-600">
            <span className={`h-2 w-2 rounded-full ${segment.dotClassName}`} />
            {segment.label}
            <span className="font-semibold text-slate-900">{stats[segment.key]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
