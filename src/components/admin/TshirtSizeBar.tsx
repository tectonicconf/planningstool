import type { TshirtSizeStats } from "@/lib/adminActivity";
import { StatBar } from "@/components/admin/StatBar";

const SIZE_COLORS: Record<string, string> = {
  XS: "bg-sky-300",
  S: "bg-sky-500",
  M: "bg-indigo-500",
  L: "bg-violet-500",
  XL: "bg-fuchsia-500",
  XXL: "bg-rose-500",
};
const FALLBACK_COLOR = "bg-slate-300";

export function TshirtSizeBar({ stats }: { stats: TshirtSizeStats }) {
  return (
    <StatBar
      title="T-shirt sizes"
      totalLabel={`${stats.total} volunteers`}
      total={stats.total}
      segments={stats.sizes.map(({ size, count }) => {
        const colorClassName = SIZE_COLORS[size] ?? FALLBACK_COLOR;

        return {
          key: size,
          label: size,
          value: count,
          barClassName: colorClassName,
          dotClassName: colorClassName,
        };
      })}
    />
  );
}
