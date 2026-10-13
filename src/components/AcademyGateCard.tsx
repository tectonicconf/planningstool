"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SHIFTS_OPEN_AT } from "@/lib/constants";

// Only two real steps now (welcome, then the quiz itself — see
// AcademyFlow.tsx), so progress is just "haven't started" vs "already saw
// the welcome screen and can jump straight to the quiz".
export type AcademyProgress = "not-started" | "ready-for-quiz";

const PROGRESS_COPY: Record<
  "ready-for-quiz",
  {
    badge: string;
    badgeClass: string;
    description: React.ReactNode;
    progressPercent: number | null;
    buttonLabel: string;
  }
> = {
  "ready-for-quiz": {
    badge: "Almost done",
    badgeClass: "bg-amber-500/20 text-amber-300",
    description: "Just the quiz left (~2 min)",
    progressPercent: 50,
    buttonLabel: "Finish quiz",
  },
};

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function formatOpenDate(targetIso: string) {
  return new Date(targetIso).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Ticks every second once mounted. Starts at `null` (rather than computing
// immediately) so the server-rendered markup and the first client render
// match — the real value only exists once this runs in the browser.
function useCountdown(targetIso: string) {
  const target = new Date(targetIso).getTime();
  const [msLeft, setMsLeft] = useState<number | null>(null);

  useEffect(() => {
    function tick() {
      setMsLeft(Math.max(0, target - Date.now()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return msLeft;
}

function ClockIcon() {
  return (
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
  );
}

function ShiftsOpenCard() {
  const msLeft = useCountdown(SHIFTS_OPEN_AT);
  const expired = msLeft !== null && msLeft <= 0;

  const totalSeconds = msLeft !== null ? Math.floor(msLeft / 1000) : 0;
  const countdown = [
    { value: Math.floor(totalSeconds / 86400), label: "Days" },
    { value: Math.floor((totalSeconds % 86400) / 3600), label: "Hours" },
    { value: Math.floor((totalSeconds % 3600) / 60), label: "Minutes" },
    { value: totalSeconds % 60, label: "Seconds" },
  ];

  return (
    <div className="rounded-2xl border border-blue-400/20 bg-blue-950/30 p-6 text-white">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a0f35] px-3 py-1.5 text-xs font-bold tracking-wide text-blue-200">
        <ClockIcon />
        {expired ? "SHIFTS OPEN" : "SHIFTS OPEN SOON"}
      </span>

      {expired ? (
        <>
          <h3 className="mt-4 text-2xl font-extrabold leading-tight">
            Shifts are now available!
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-blue-100/70">
            Complete onboarding to access your shifts.
          </p>
        </>
      ) : (
        <>
          <h3 className="mt-4 text-2xl font-extrabold leading-tight">
            Shifts open on {formatOpenDate(SHIFTS_OPEN_AT)}!
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-blue-100/70">
            In the meantime, you can already complete your onboarding. From
            then on, you can view and accept your shifts.
          </p>

          {msLeft !== null && (
            <div className="mt-5 flex gap-2">
              {countdown.map(({ value, label }, index) => {
                const isLast = index === countdown.length - 1;

                return (
                  <div
                    key={label}
                    className={`flex-1 rounded-2xl border bg-[#02040f] px-2 py-3 text-center ${
                      isLast
                        ? "border-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.45)]"
                        : "border-white/10"
                    }`}
                  >
                    <p className="text-3xl font-extrabold tabular-nums">
                      {pad(value)}
                    </p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-200/60">
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <Link
        href="/onboarding"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 px-6 py-3 text-sm font-bold text-white transition-transform hover:brightness-110 active:scale-[0.99]"
      >
        Go to onboarding
        <span aria-hidden="true">&rarr;</span>
      </Link>
    </div>
  );
}

export function AcademyGateCard({
  progress,
  onStart,
}: {
  progress: AcademyProgress;
  onStart: () => void;
}) {
  if (progress === "not-started") {
    return <ShiftsOpenCard />;
  }

  const copy = PROGRESS_COPY[progress];

  return (
    <div className="rounded-2xl border border-blue-400/20 bg-blue-950/20 p-5 text-white">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">Tectonic Academy</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${copy.badgeClass}`}
        >
          {copy.badge}
        </span>
      </div>
      <p className="mt-2 text-sm text-blue-100/70">{copy.description}</p>

      {copy.progressPercent !== null && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-blue-950/50">
          <div
            className="h-full rounded-full bg-blue-400"
            style={{ width: `${copy.progressPercent}%` }}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onStart}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 py-3 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99]"
      >
        {copy.buttonLabel}
        <span aria-hidden="true">&rarr;</span>
      </button>
    </div>
  );
}
