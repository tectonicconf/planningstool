"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UnassignedVolunteer } from "@/lib/adminActivity";

const PAGE_SIZE = 10;

export function UnassignedVolunteers({
  volunteers,
}: {
  volunteers: UnassignedVolunteer[];
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
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Not yet assigned ({volunteers.length})
      </h2>
      <div className="mt-3 flex flex-col gap-2">
        {volunteers.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500">
            Every volunteer has at least one shift.
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
              <p className="truncate font-medium text-slate-900">
                {volunteer.name}
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
