import type { Shift } from "@/lib/shifts";
import { formatShiftDate, STATUS_STYLES, STATUS_LABELS } from "@/components/ShiftCard";
import {
  templateStatus,
  templateHours,
  templateTimeRange,
  pendingBlocks,
} from "@/lib/templateShift";

const PARTIAL_STYLE = "bg-amber-500/20 text-amber-200";

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

export function TemplateCard({
  blocks,
  isUpdating,
  onAcceptAll,
  onDeclineAll,
  onOpenDetail,
}: {
  blocks: Shift[];
  isUpdating: boolean;
  onAcceptAll: () => void;
  onDeclineAll: () => void;
  onOpenDetail: () => void;
}) {
  const status = templateStatus(blocks);
  const hours = templateHours(blocks);
  const range = templateTimeRange(blocks);
  const remaining = pendingBlocks(blocks);
  const confirmedCount = blocks.length - remaining.length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpenDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetail();
        }
      }}
      className="cursor-pointer rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-5 text-white transition-colors hover:border-blue-300/40"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-white/50">
          Rotation shift · {blocks.length} blocks
        </span>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
            status === "partial" ? PARTIAL_STYLE : STATUS_STYLES[status]
          }`}
        >
          {status === "partial"
            ? `${confirmedCount} of ${blocks.length} accepted`
            : STATUS_LABELS[status]}
        </span>
      </div>

      <p className="mt-2 font-semibold">
        {formatShiftDate(range.date)} · {range.startTime} – {range.endTime} ({hours}h)
      </p>

      <div className="mt-3 flex gap-1">
        {blocks.map((block) => (
          <div
            key={block.assignmentId}
            className={`h-1.5 rounded-full ${
              block.status === "confirmed" ? "bg-emerald-400" : "bg-blue-400/50"
            }`}
            style={{ flexGrow: block.hours || 1 }}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {blocks.map((block) => (
          <div
            key={block.assignmentId}
            className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-sm"
          >
            <span className="shrink-0 text-white/50">
              <ClockIcon />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {block.startTime} – {block.endTime} ({block.hours}h)
              </p>
              <p className="truncate text-xs text-white/60">
                {block.location} · {block.shiftTitle || block.shiftType}
              </p>
            </div>
            <span
              className={`shrink-0 text-xs font-medium ${
                block.status === "confirmed" ? "text-emerald-300" : "text-blue-200"
              }`}
            >
              {STATUS_LABELS[block.status]}
            </span>
          </div>
        ))}
      </div>

      {status !== "confirmed" && (
        <div className="mt-4" onClick={(event) => event.stopPropagation()}>
          {status === "partial" && (
            <p className="mb-3 rounded-xl bg-amber-500/15 px-3 py-2 text-sm text-amber-100">
              You only accepted part of this rotation shift. Please confirm
              the rest so the day is fully covered — or decline all if you
              can no longer make it.
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isUpdating}
              onClick={onAcceptAll}
              className="flex-1 rounded-full bg-gradient-to-b from-[#2F5BFF] to-[#1137EA] border border-white/25 shadow-[0_0_28px_-8px_#1141E9] py-2 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              {status === "partial"
                ? `Accept remaining block${remaining.length === 1 ? "" : "s"}`
                : `Accept all ${blocks.length} blocks`}
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={onDeclineAll}
              className="flex-1 rounded-full border border-white/25 py-2 text-sm font-semibold text-white/90 transition-colors hover:border-cyan-300/70 disabled:opacity-50"
            >
              Decline all
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-white/50">
            {status === "partial"
              ? "Declining cancels every block, including the ones you already accepted — a rotation shift is all or nothing."
              : "One tap confirms or declines the whole rotation shift."}
          </p>
        </div>
      )}
    </div>
  );
}
