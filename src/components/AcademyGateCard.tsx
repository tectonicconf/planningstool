"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SHIFTS_OPEN_AT } from "@/lib/constants";

// Three real steps in AcademyFlow.tsx (welcome, the essentials, then the
// quiz). The gate card only tracks the coarser "info phase" vs "quiz phase"
// distinction: "info-in-progress" covers being on either the welcome or the
// essentials screen, "info-done" means the essentials are read and only the
// quiz is left.
export type AcademyProgress = "not-started" | "info-in-progress" | "info-done";

const PROGRESS_COPY: Record<
  "info-in-progress" | "info-done",
  {
    badge: string;
    badgeClass: string;
    description: React.ReactNode;
    progressPercent: number | null;
    buttonLabel: string;
  }
> = {
  "info-in-progress": {
    badge: "In progress",
    badgeClass: "bg-blue-500/20 text-blue-200",
    description: "Step 1 of 2 in progress",
    progressPercent: 50,
    buttonLabel: "Continue",
  },
  "info-done": {
    badge: "Almost done",
    badgeClass: "bg-amber-500/20 text-amber-300",
    description: "Info step complete · just the quiz left (~2 min)",
    progressPercent: 90,
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
// match — the real value only exists once this runs in the browser. Also
// used by ShiftDashboard.tsx to gate the real shift list behind the same
// countdown, independently of onboarding-quiz completion.
export function useCountdown(targetIso: string) {
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

function CountdownDigits({ msLeft }: { msLeft: number }) {
  const totalSeconds = Math.floor(msLeft / 1000);
  const countdown = [
    { value: Math.floor(totalSeconds / 86400), label: "Days" },
    { value: Math.floor((totalSeconds % 86400) / 3600), label: "Hours" },
    { value: Math.floor((totalSeconds % 3600) / 60), label: "Minutes" },
    { value: totalSeconds % 60, label: "Seconds" },
  ];

  return (
    <div className="mt-5 flex gap-2">
      {countdown.map(({ value, label }, index) => {
        const isLast = index === countdown.length - 1;

        return (
          <div
            key={label}
            className={`flex-1 rounded-2xl border bg-[#02040f] px-2 py-3 text-center ${
              isLast
                ? "border-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.45)]"
                : "border-white/10"
            }`}
          >
            <p className="text-3xl font-extrabold tabular-nums">{pad(value)}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/50">
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Shown once the quiz is passed but the countdown hasn't finished yet — the
// shift list stays locked until both are true, see ShiftDashboard.tsx.
export function QuizDoneWaitingCard() {
  const msLeft = useCountdown(SHIFTS_OPEN_AT);

  if (msLeft === null) return null;

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-6 text-white">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-300/10 px-3 py-1.5 text-xs font-bold tracking-wide text-cyan-300">
        <ClockIcon />
        ONBOARDING COMPLETE
      </span>
      <h3 className="mt-4 text-2xl font-extrabold leading-tight">
        You&apos;re all set!
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-white/70">
        Your shifts unlock on {formatOpenDate(SHIFTS_OPEN_AT)}.
      </p>
      <CountdownDigits msLeft={msLeft} />
    </div>
  );
}

function ShiftsOpenCard({ onJumpToQuiz }: { onJumpToQuiz: () => void }) {
  const msLeft = useCountdown(SHIFTS_OPEN_AT);
  const expired = msLeft !== null && msLeft <= 0;

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-6 text-white">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-300/10 px-3 py-1.5 text-xs font-bold tracking-wide text-cyan-300">
        <ClockIcon />
        {expired ? "SHIFTS OPEN" : "SHIFTS OPEN SOON"}
      </span>

      {expired ? (
        <>
          <h3 className="mt-4 text-2xl font-extrabold leading-tight">
            Shifts are now available!
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Complete onboarding to access your shifts.
          </p>
        </>
      ) : (
        <>
          <h3 className="mt-4 text-2xl font-extrabold leading-tight">
            Shifts open on {formatOpenDate(SHIFTS_OPEN_AT)}!
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            In the meantime, you can already complete your onboarding. From
            then on, you can view and accept your shifts.
          </p>

          {msLeft !== null && <CountdownDigits msLeft={msLeft} />}
        </>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#2F5BFF] to-[#1137EA] border border-white/25 shadow-[0_0_28px_-8px_#1141E9] px-6 py-3 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99]"
        >
          Go to onboarding
          <span aria-hidden="true">&rarr;</span>
        </Link>
        <button
          type="button"
          onClick={onJumpToQuiz}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-300/60 px-6 py-3 text-sm font-semibold text-cyan-300 transition-colors hover:border-cyan-200 hover:text-cyan-200"
        >
          I&apos;ve been through onboarding, take me to the quiz
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}

export function AcademyGateCard({
  progress,
  onStart,
  onJumpToQuiz,
}: {
  progress: AcademyProgress;
  onStart: () => void;
  onJumpToQuiz: () => void;
}) {
  if (progress === "not-started") {
    return <ShiftsOpenCard onJumpToQuiz={onJumpToQuiz} />;
  }

  const copy = PROGRESS_COPY[progress];

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-5 text-white">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">Unlock your shifts</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${copy.badgeClass}`}
        >
          {copy.badge}
        </span>
      </div>
      <p className="mt-2 text-sm text-white/70">{copy.description}</p>

      {copy.progressPercent !== null && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#0D1341]/50">
          <div
            className="h-full rounded-full bg-cyan-300"
            style={{ width: `${copy.progressPercent}%` }}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onStart}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#2F5BFF] to-[#1137EA] border border-white/25 shadow-[0_0_28px_-8px_#1141E9] py-3 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-[0.99]"
      >
        {copy.buttonLabel}
        <span aria-hidden="true">&rarr;</span>
      </button>
    </div>
  );
}
