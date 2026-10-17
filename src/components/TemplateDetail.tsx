"use client";

import { useState } from "react";
import type { Shift } from "@/lib/shifts";
import { formatShiftDate, STATUS_LABELS, STATUS_STYLES } from "@/components/ShiftCard";
import { ShiftBlockBody } from "@/components/ShiftBlockBody";
import {
  templateStatus,
  templateHours,
  templateTimeRange,
  pendingBlocks,
} from "@/lib/templateShift";

const PARTIAL_STYLE = "bg-amber-500/20 text-amber-200";

function BlockStatusIcon({ status }: { status: Shift["status"] }) {
  if (status === "confirmed") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    );
  }

  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    </span>
  );
}

export function TemplateDetail({
  blocks,
  isUpdating,
  onAcceptAll,
  onDeclineAll,
  onClose,
}: {
  blocks: Shift[];
  isUpdating: boolean;
  onAcceptAll: () => void;
  onDeclineAll: () => void;
  onClose: () => void;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(
    blocks[0]?.assignmentId ?? null,
  );

  const status = templateStatus(blocks);
  const hours = templateHours(blocks);
  const range = templateTimeRange(blocks);
  const remaining = pendingBlocks(blocks);

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
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
            status === "partial" ? PARTIAL_STYLE : STATUS_STYLES[status]
          }`}
        >
          {status === "partial"
            ? `${blocks.length - remaining.length} of ${blocks.length} accepted`
            : STATUS_LABELS[status]}
        </span>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-bold">{formatShiftDate(range.date)}</h1>
          <span className="text-sm text-white/60">Rotation shift · {blocks.length} blocks</span>
        </div>

        <p className="mt-2 text-sm text-white/70">
          {range.startTime} – {range.endTime} ({hours}h)
        </p>

        <div className="mt-4 flex gap-1">
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

        <div className="mt-6 flex flex-col gap-3">
          {blocks.map((block) => {
            const expanded = expandedId === block.assignmentId;

            return (
              <div
                key={block.assignmentId}
                className="rounded-2xl border border-white/15 bg-white/[0.04]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId((current) =>
                      current === block.assignmentId ? null : block.assignmentId,
                    )
                  }
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <BlockStatusIcon status={block.status} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {block.startTime} – {block.endTime} ({block.hours}h)
                    </p>
                    <p className="truncate text-sm text-white/60">
                      {block.location} · {block.shiftTitle || block.shiftType}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`shrink-0 text-white/60 transition-transform ${
                      expanded ? "rotate-90" : ""
                    }`}
                  >
                    &rsaquo;
                  </span>
                </button>

                {expanded && (
                  <div className="flex flex-col gap-0 px-4 pb-4">
                    {block.shiftLead && (
                      <p className="mb-3 text-sm text-white/60">
                        Shift lead: <span className="text-white">{block.shiftLead}</span>
                      </p>
                    )}
                    <ShiftBlockBody shift={block} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-white/15 bg-[#050A2B]">
        <div className="mx-auto w-full max-w-2xl px-6 py-6">
          {remaining.length > 0 ? (
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isUpdating}
                onClick={onAcceptAll}
                className="flex-1 rounded-full bg-gradient-to-b from-[#2F5BFF] to-[#1137EA] border border-white/25 shadow-[0_0_28px_-8px_#1141E9] py-3 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
              >
                {status === "partial"
                  ? `Accept remaining block${remaining.length === 1 ? "" : "s"}`
                  : `Accept all ${blocks.length} blocks`}
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={onDeclineAll}
                className="flex-1 rounded-full border border-white/25 py-3 text-sm font-semibold text-white/90 transition-colors hover:border-red-300/60 hover:text-red-200 disabled:opacity-50"
              >
                Decline all
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isUpdating}
              onClick={onDeclineAll}
              className="w-full rounded-full border border-white/25 py-3 text-sm font-semibold text-white/90 transition-colors hover:border-red-300/60 hover:text-red-200 disabled:opacity-50"
            >
              Decline all blocks
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
