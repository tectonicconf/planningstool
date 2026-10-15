import type { QuizCompletionStats } from "@/lib/adminActivity";
import { StatBar } from "@/components/admin/StatBar";

export function QuizCompletionBar({ stats }: { stats: QuizCompletionStats }) {
  return (
    <StatBar
      title="Quiz completion"
      totalLabel={`${stats.total} volunteers`}
      total={stats.total}
      segments={[
        {
          key: "completed",
          label: "Finalised",
          value: stats.completed,
          barClassName: "bg-emerald-500",
          dotClassName: "bg-emerald-500",
        },
        {
          key: "notCompleted",
          label: "Not finalised",
          value: stats.notCompleted,
          barClassName: "bg-rose-400",
          dotClassName: "bg-rose-400",
        },
      ]}
    />
  );
}
