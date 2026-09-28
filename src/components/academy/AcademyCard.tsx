"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAcademyStatus, type AcademyStatus } from "@/lib/academyProgress";

const STATUS_COPY: Record<
  AcademyStatus,
  { badge: string; badgeClassName: string; description: string; cta: string }
> = {
  not_started: {
    badge: "NOT STARTED",
    badgeClassName: "bg-white/10 text-blue-100/70",
    description:
      "Event guide + startup ecosystem crash course, plus a short onboarding quiz — ~15 min.",
    cta: "Start",
  },
  guide_done: {
    badge: "IN PROGRESS",
    badgeClassName: "bg-blue-500/20 text-blue-200",
    description: "Info step complete — just the quiz left (~2 min).",
    cta: "Continue",
  },
  quiz_failed: {
    badge: "ALMOST DONE",
    badgeClassName: "bg-amber-500/20 text-amber-200",
    description: "Quick check not passed yet — you can retake it right away.",
    cta: "Retake quiz",
  },
  completed: {
    badge: "COMPLETED",
    badgeClassName: "bg-emerald-500/20 text-emerald-200",
    description: "Nice work — you're all set. Revisit anytime.",
    cta: "Review",
  },
};

export function AcademyCard({ token }: { token: string }) {
  // Read the (client-only) progress after mount to avoid an SSR/client mismatch.
  const [status, setStatus] = useState<AcademyStatus>("not_started");

  useEffect(() => {
    setStatus(getAcademyStatus(token));
  }, [token]);

  const copy = STATUS_COPY[status];

  return (
    <Link
      href={`/academy/${encodeURIComponent(token)}`}
      className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 px-5 py-4 transition-colors hover:border-cyan-300/40"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-white">Tectonic Academy</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${copy.badgeClassName}`}
          >
            {copy.badge}
          </span>
        </div>
        <p className="text-sm text-blue-100/70">{copy.description}</p>
      </div>
      <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-[#050822]">
        {copy.cta} →
      </span>
    </Link>
  );
}
