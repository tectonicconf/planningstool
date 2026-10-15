import type { ShiftCoverageStats } from "@/lib/adminActivity";
import { StatBar } from "@/components/admin/StatBar";

export function ShiftCoverageBar({ stats }: { stats: ShiftCoverageStats }) {
  return (
    <StatBar
      title="Shift coverage"
      totalLabel={`${stats.totalNeeded} total spots`}
      total={stats.totalNeeded}
      segments={[
        {
          key: "confirmed",
          label: "Confirmed",
          value: stats.confirmed,
          barClassName: "bg-emerald-500",
          dotClassName: "bg-emerald-500",
        },
        {
          key: "pending",
          label: "Pending",
          value: stats.pending,
          barClassName: "bg-blue-500",
          dotClassName: "bg-blue-500",
        },
        {
          key: "open",
          label: "Not assigned",
          value: stats.open,
          barClassName: "bg-amber-400",
          dotClassName: "bg-amber-400",
        },
      ]}
    />
  );
}
