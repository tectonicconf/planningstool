"use client";

export type AcademyProgress = "not-started" | "info-in-progress" | "info-done";

const PROGRESS_COPY: Record<
  AcademyProgress,
  {
    badge: string;
    badgeClass: string;
    description: React.ReactNode;
    progressPercent: number | null;
    buttonLabel: string;
  }
> = {
  "not-started": {
    badge: "Not started",
    badgeClass: "bg-blue-500/20 text-blue-200",
    description:
      "Event facts, the essentials and a short quiz. About 5 minutes. Your shifts unlock once you pass.",
    progressPercent: null,
    buttonLabel: "Start",
  },
  "info-in-progress": {
    badge: "In progress",
    badgeClass: "bg-blue-500/20 text-blue-200",
    description: "Next up: the essentials and the quiz.",
    progressPercent: 33,
    buttonLabel: "Continue",
  },
  "info-done": {
    badge: "Almost done",
    badgeClass: "bg-amber-500/20 text-amber-300",
    description: "Just the quiz left, about 2 minutes.",
    progressPercent: 66,
    buttonLabel: "Finish quiz",
  },
};

export function AcademyGateCard({
  progress,
  onStart,
}: {
  progress: AcademyProgress;
  onStart: () => void;
}) {
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
