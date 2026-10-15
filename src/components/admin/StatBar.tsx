export type StatBarSegment = {
  key: string;
  label: string;
  value: number;
  barClassName: string;
  dotClassName: string;
};

// Shared visual for the small stacked-bar stat cards at the top of the
// Activity page (shift coverage, quiz completion, t-shirt sizes) — same
// bar + legend layout, just different segments.
export function StatBar({
  title,
  totalLabel,
  total,
  segments,
}: {
  title: string;
  totalLabel: string;
  total: number;
  segments: StatBarSegment[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h2>
        <span className="text-xs text-slate-400">{totalLabel}</span>
      </div>

      <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {segments.map((segment) => {
          const pct = total > 0 ? (segment.value / total) * 100 : 0;

          return pct > 0 ? (
            <div
              key={segment.key}
              className={segment.barClassName}
              style={{ width: `${pct}%` }}
              title={`${segment.label}: ${segment.value}`}
            />
          ) : null;
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {segments.map((segment) => (
          <span key={segment.key} className="flex items-center gap-1.5 text-slate-600">
            <span className={`h-2 w-2 rounded-full ${segment.dotClassName}`} />
            {segment.label}
            <span className="font-semibold text-slate-900">{segment.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
