"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { VolunteerShiftSummary } from "@/lib/adminActivity";

const PAGE_SIZE = 10;

function csvCell(value: string): string {
  // Defensive against stray nulls from the DB (e.g. an email/name column
  // that's nullable in practice despite its TS type — see CLAUDE.md on the
  // `quiz` column for the same pattern elsewhere in this codebase).
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, volunteers: VolunteerShiftSummary[]) {
  const header = ["Name", "Email", "Phone", "Shift count", "Busy past 18:31 Wed"];
  const rows = volunteers.map((v) => [
    v.name,
    v.email,
    v.phone,
    String(v.shiftCount),
    v.hasLateShift ? "Yes" : "No",
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function VolunteerShiftCountList({
  title,
  volunteers,
  emptyMessage,
}: {
  title: string;
  volunteers: VolunteerShiftSummary[];
  emptyMessage: string;
}) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? volunteers : volunteers.slice(0, PAGE_SIZE);
  const hiddenCount = volunteers.length - visible.length;

  function goToVolunteer(id: string) {
    router.push(`/admin/volunteers?search=${encodeURIComponent(id)}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title} ({volunteers.length})
        </h2>
        <button
          type="button"
          disabled={volunteers.length === 0}
          onClick={() => downloadCsv(`${title.toLowerCase().replace(/\s+/g, "-")}.csv`, volunteers)}
          className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {volunteers.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500">
            {emptyMessage}
          </p>
        ) : (
          visible.map((volunteer) => (
            <div
              key={volunteer.id}
              role="button"
              tabIndex={0}
              onClick={() => goToVolunteer(volunteer.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  goToVolunteer(volunteer.id);
                }
              }}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-slate-300"
            >
              <p className="flex items-center justify-between gap-2 truncate font-medium text-slate-900">
                {volunteer.name}
                {volunteer.hasLateShift && (
                  <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    busy past 18:31 Wed
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-slate-500">
                {volunteer.email}
                {volunteer.phone ? ` · ${volunteer.phone}` : ""}
              </p>
            </div>
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
