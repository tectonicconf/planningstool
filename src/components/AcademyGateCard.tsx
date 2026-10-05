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
      "Event guide + startup ecosystem crash course, plus a short onboarding quiz · ~15 min",
    progressPercent: null,
    buttonLabel: "Start",
  },
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

export function AcademyGateCard({
  progress,
  onStart,
}: {
  progress: AcademyProgress;
  onStart: () => void;
}) {
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
