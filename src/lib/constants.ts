
export const ROLE_CATEGORIES = [
  "Setup & Logistics",
  "Technical Support",
  "Guest Flow & Stewarding",
  "Info & Welcome",
  "Food & Drinks",
  "Runner & Flexible Support",
  "Stage & Session Support",
  "Backup",
] as const;

export const TIME_SLOTS = ["Morning", "Afternoon", "Evening"] as const;

// Evening's `end` is earlier than its `start` on purpose — it means the
// window runs past midnight, into the next calendar day (see
// `crossesMidnight`). shiftEligibility.ts is the only place that reads
// `crossesMidnight`; everything else just uses start/end as plain "HH:MM".
export const TIME_SLOT_WINDOWS: Record<
  string,
  { start: string; end: string; crossesMidnight?: boolean }
> = {
  Morning: { start: "06:00", end: "13:00" },
  Afternoon: { start: "13:00", end: "18:00" },
  Evening: { start: "18:00", end: "04:00", crossesMidnight: true },
};

// `slot` still matters for filtering/display (see constants.ts usages), but
// no longer gates assignment eligibility — isVolunteerAvailableForShift now
// compares actual timestamps instead. There's no reason to make an admin
// pick it by hand when it follows directly from the start time they just
// entered, so it's derived instead of selected.
export function deriveSlotFromStartTime(startTime: string): (typeof TIME_SLOTS)[number] {
  if (startTime >= TIME_SLOT_WINDOWS.Evening.start || startTime < TIME_SLOT_WINDOWS.Morning.start) {
    return "Evening";
  }
  if (startTime < TIME_SLOT_WINDOWS.Afternoon.start) return "Morning";
  return "Afternoon";
}

// Rounds to the nearest half hour, matching the "Hours" input's step={0.5}
// in the create-shift forms (Planning and Shifts boards). Returns 0 for an
// empty/invalid/non-positive range rather than throwing, so it's safe to
// call on every keystroke while the fields fill in. Takes the full
// start/end date so a shift that runs past midnight (endDate !== date)
// still gets a correct, positive duration.
export function computeHoursBetween(
  date: string,
  startTime: string,
  endDate: string,
  endTime: string,
): number {
  const start = new Date(`${date}T${startTime}`).getTime();
  const end = new Date(`${endDate}T${endTime}`).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return 0;

  const minutes = (end - start) / 60000;
  return minutes > 0 ? Math.round((minutes / 60) * 2) / 2 : 0;
}

export const SHIFT_COUNT_PREFERENCES = ["1", "2", "3", "4+", "No preference"] as const;

// Fixed display order for the t-shirt size breakdown on the Activity page.
export const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

// The moment shifts become visible/acceptable on a volunteer's dashboard —
// drives the countdown in AcademyGateCard.tsx. Local wall-clock time (the
// event itself is in Belgium), not UTC.
export const SHIFTS_OPEN_AT = "2026-10-15T15:00:00";

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

type RoleStyle = {
  emoji: string;
  badgeClassName: string;
  cardClassName: string;
  // Solid/light pair for the Timeline tab's two-tone bars (filled portion vs
  // remaining capacity) — same hue family as badgeClassName/cardClassName
  // above, just saturated enough to read against a white grid.
  barClassName: string;
  barLightClassName: string;
};

export const ROLE_STYLES: Record<string, RoleStyle> = {
  "Setup & Logistics": {
    emoji: "🛠️",
    badgeClassName: "bg-blue-100 text-blue-700",
    cardClassName: "border-blue-100 bg-blue-50",
    barClassName: "bg-blue-500",
    barLightClassName: "bg-blue-200",
  },
  "Technical Support": {
    emoji: "⚙️",
    badgeClassName: "bg-rose-100 text-rose-700",
    cardClassName: "border-rose-100 bg-rose-50",
    barClassName: "bg-rose-500",
    barLightClassName: "bg-rose-200",
  },
  "Guest Flow & Stewarding": {
    emoji: "🚶",
    badgeClassName: "bg-emerald-100 text-emerald-700",
    cardClassName: "border-emerald-100 bg-emerald-50",
    barClassName: "bg-emerald-500",
    barLightClassName: "bg-emerald-200",
  },
  "Info & Welcome": {
    emoji: "ℹ️",
    badgeClassName: "bg-violet-100 text-violet-700",
    cardClassName: "border-violet-100 bg-violet-50",
    barClassName: "bg-violet-500",
    barLightClassName: "bg-violet-200",
  },
  "Food & Drinks": {
    emoji: "🍽️",
    badgeClassName: "bg-amber-100 text-amber-700",
    cardClassName: "border-amber-100 bg-amber-50",
    barClassName: "bg-amber-500",
    barLightClassName: "bg-amber-200",
  },
  "Runner & Flexible Support": {
    emoji: "🏃",
    badgeClassName: "bg-cyan-100 text-cyan-700",
    cardClassName: "border-cyan-100 bg-cyan-50",
    barClassName: "bg-cyan-500",
    barLightClassName: "bg-cyan-200",
  },
  "Stage & Session Support": {
    emoji: "🎤",
    badgeClassName: "bg-fuchsia-100 text-fuchsia-700",
    cardClassName: "border-fuchsia-100 bg-fuchsia-50",
    barClassName: "bg-fuchsia-500",
    barLightClassName: "bg-fuchsia-200",
  },
  // Not in ROLE_CATEGORIES (admins can't pick it on the create-shift form),
  // but present in real imported shift data — needs its own style or it
  // falls back to DEFAULT_ROLE_STYLE like every other unrecognised value.
  "Content & Media": {
    emoji: "🎥",
    badgeClassName: "bg-indigo-100 text-indigo-700",
    cardClassName: "border-indigo-100 bg-indigo-50",
    barClassName: "bg-indigo-500",
    barLightClassName: "bg-indigo-200",
  },
  Backup: {
    emoji: "🧯",
    badgeClassName: "bg-teal-100 text-teal-700",
    cardClassName: "border-teal-100 bg-teal-50",
    barClassName: "bg-teal-500",
    barLightClassName: "bg-teal-200",
  },
};

export const DEFAULT_ROLE_STYLE: RoleStyle = {
  emoji: "📌",
  badgeClassName: "bg-slate-100 text-slate-700",
  cardClassName: "border-slate-100 bg-slate-50",
  barClassName: "bg-slate-400",
  barLightClassName: "bg-slate-200",
};
