
export const ROLE_CATEGORIES = [
  "Setup & Logistics",
  "Technical Support",
  "Guest Flow & Stewarding",
  "Info & Welcome",
  "Food & Drinks",
  "Runner & Flexible Support",
  "Stage & Session Support",
] as const;

export const TIME_SLOTS = ["Morning", "Afternoon", "Evening"] as const;

export const TIME_SLOT_WINDOWS: Record<string, { start: string; end: string }> = {
  Morning: { start: "07:00", end: "13:00" },
  Afternoon: { start: "13:00", end: "18:00" },
  Evening: { start: "18:00", end: "23:59" },
};

export const SHIFT_COUNT_PREFERENCES = ["1", "2", "3", "4+", "No preference"] as const;

// The moment shifts become visible/acceptable on a volunteer's dashboard —
// drives the countdown in AcademyGateCard.tsx. Local wall-clock time (the
// event itself is in Belgium), not UTC.
export const SHIFTS_OPEN_AT = "2026-10-15T12:00:00";

export type AvailabilityOption = {
  date: string;
  slot: (typeof TIME_SLOTS)[number];
  label: string;
};

// The event's fixed availability windows. `date`+`slot` match how
// `volunteers.availability` stores each entry (see `availabilityValue`
// below) and how shifts.slot/date are compared in shiftEligibility.ts.
export const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  { date: "2026-10-20", slot: "Morning", label: "October 20 - Morning (Hackathon or Setup)" },
  { date: "2026-10-20", slot: "Afternoon", label: "October 20 - Afternoon (Hackathon or Setup)" },
  { date: "2026-10-20", slot: "Evening", label: "October 20 - Evening (Hackathon or Setup)" },
  { date: "2026-10-21", slot: "Morning", label: "October 21 - Morning" },
  { date: "2026-10-21", slot: "Afternoon", label: "October 21 - Afternoon" },
  { date: "2026-10-21", slot: "Evening", label: "October 21 - Evening" },
  { date: "2026-10-22", slot: "Morning", label: "October 22 - Morning (Breakdown)" },
];

export function availabilityValue(date: string, slot: string): string {
  return `${date} ${slot}`;
}

type RoleStyle = { emoji: string; badgeClassName: string; cardClassName: string };

export const ROLE_STYLES: Record<string, RoleStyle> = {
  "Setup & Logistics": {
    emoji: "🛠️",
    badgeClassName: "bg-blue-100 text-blue-700",
    cardClassName: "border-blue-100 bg-blue-50",
  },
  "Technical Support": {
    emoji: "⚙️",
    badgeClassName: "bg-rose-100 text-rose-700",
    cardClassName: "border-rose-100 bg-rose-50",
  },
  "Guest Flow & Stewarding": {
    emoji: "🚶",
    badgeClassName: "bg-emerald-100 text-emerald-700",
    cardClassName: "border-emerald-100 bg-emerald-50",
  },
  "Info & Welcome": {
    emoji: "ℹ️",
    badgeClassName: "bg-violet-100 text-violet-700",
    cardClassName: "border-violet-100 bg-violet-50",
  },
  "Food & Drinks": {
    emoji: "🍽️",
    badgeClassName: "bg-amber-100 text-amber-700",
    cardClassName: "border-amber-100 bg-amber-50",
  },
  "Runner & Flexible Support": {
    emoji: "🏃",
    badgeClassName: "bg-cyan-100 text-cyan-700",
    cardClassName: "border-cyan-100 bg-cyan-50",
  },
  "Stage & Session Support": {
    emoji: "🎤",
    badgeClassName: "bg-fuchsia-100 text-fuchsia-700",
    cardClassName: "border-fuchsia-100 bg-fuchsia-50",
  },
};

export const DEFAULT_ROLE_STYLE: RoleStyle = {
  emoji: "📌",
  badgeClassName: "bg-slate-100 text-slate-700",
  cardClassName: "border-slate-100 bg-slate-50",
};
