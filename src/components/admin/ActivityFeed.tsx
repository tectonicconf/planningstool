"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AssignmentUpdate, RecentAssignmentUpdates } from "@/lib/adminActivity";

function formatShiftDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatUpdatedAt(updatedAt: string) {
  return new Date(updatedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityRow({
  update,
  accentClassName,
  expanded,
  onToggleExpand,
}: {
  update: AssignmentUpdate;
  accentClassName: string;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const router = useRouter();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() =>
        router.push(`/admin/volunteers?search=${encodeURIComponent(update.volunteerId)}`)
      }
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/admin/volunteers?search=${encodeURIComponent(update.volunteerId)}`);
        }
      }}
      className={`cursor-pointer rounded-xl border-l-4 border-y border-r border-slate-200 bg-white transition-colors hover:border-slate-300 ${accentClassName}`}
    >
      <div className="flex items-center justify-between gap-3 py-3 pl-3 pr-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">
            {update.volunteerName}
          </p>
          <p className="truncate text-sm text-slate-500">
            {formatShiftDate(update.date)} · {update.startTime}–{update.endTime}{" "}
            · {update.location} · {update.roleCategory}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-slate-400">
            {formatUpdatedAt(update.updatedAt)}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpand();
            }}
            aria-label={expanded ? "Hide details" : "Show details"}
            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <span
              className={`inline-block transition-transform ${expanded ? "rotate-90" : ""}`}
              aria-hidden="true"
            >
              &rsaquo;
            </span>
          </button>
        </div>
      </div>

      {expanded && (
        <div
          onClick={(event) => event.stopPropagation()}
          className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600"
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="text-slate-400">Location</dt>
            <dd>{update.location}</dd>
            <dt className="text-slate-400">Hours</dt>
            <dd>
              {formatShiftDate(update.date)} · {update.startTime}–
              {update.endTime}
            </dd>
            <dt className="text-slate-400">Phone</dt>
            <dd>{update.volunteerPhone || "—"}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE = 10;

function ActivityColumn({
  title,
  items,
  emptyText,
  accentClassName,
  expandedIds,
  onToggleExpand,
}: {
  title: string;
  items: AssignmentUpdate[];
  emptyText: string;
  accentClassName: string;
  expandedIds: Set<number>;
  onToggleExpand: (assignmentId: number) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, PAGE_SIZE);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title} ({items.length})
      </h2>
      <div className="mt-3 flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500">
            {emptyText}
          </p>
        ) : (
          visibleItems.map((update) => (
            <ActivityRow
              key={update.assignmentId}
              update={update}
              accentClassName={accentClassName}
              expanded={expandedIds.has(update.assignmentId)}
              onToggleExpand={() => onToggleExpand(update.assignmentId)}
            />
          ))
        )}
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-indigo-600 hover:bg-slate-50"
          >
            Load all ({hiddenCount} more)
          </button>
        )}
      </div>
    </div>
  );
}

export function ActivityFeed({ updates }: { updates: RecentAssignmentUpdates }) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  function toggleExpand(assignmentId: number) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(assignmentId)) {
        next.delete(assignmentId);
      } else {
        next.add(assignmentId);
      }
      return next;
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <ActivityColumn
        title="Confirmed"
        items={updates.confirmed}
        emptyText="No confirmed shifts yet."
        accentClassName="border-l-emerald-400"
        expandedIds={expandedIds}
        onToggleExpand={toggleExpand}
      />
      <ActivityColumn
        title="Pending"
        items={updates.pending}
        emptyText="No pending shifts yet."
        accentClassName="border-l-blue-400"
        expandedIds={expandedIds}
        onToggleExpand={toggleExpand}
      />
      <ActivityColumn
        title="Cancelled"
        items={updates.cancelled}
        emptyText="No cancelled shifts yet."
        accentClassName="border-l-red-400"
        expandedIds={expandedIds}
        onToggleExpand={toggleExpand}
      />
    </div>
  );
}
