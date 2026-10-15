import { TIME_SLOT_WINDOWS } from "@/lib/constants";
import type { VolunteerRow } from "@/lib/adminVolunteers";

export type ShiftTimeInfo = {
  date: string;
  endDate: string;
  slot: string;
  startTime: string;
  endTime: string;
};

// Combines a date with a plain "HH:MM" into a real timestamp, so a shift or
// availability window that runs past midnight compares correctly against
// same-evening ones — comparing bare "HH:MM" strings instead would treat
// "00:00" as the earliest possible time rather than the latest, making a
// midnight-crossing range look like it never overlaps with anything later
// that evening.
function toTimestamp(date: string, time: string): number {
  return new Date(`${date}T${time}`).getTime();
}

// Pure local-date arithmetic, on purpose: building a Date from the parts,
// advancing it, then reading the parts back out — never round-tripping
// through `toISOString()` (UTC), which would shift the result by a day in
// any timezone ahead of UTC (e.g. CEST) once local midnight is involved.
function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(year, month - 1, day + days);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, "0");
  const d = String(next.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type TimeRange = { start: number; end: number };

// A volunteer's availability is self-reported per "<date> <slot>" (a
// dagdeel, not exact hours — see AVAILABILITY_OPTIONS), e.g. "2026-10-20
// Evening". This turns one such entry into the real timestamp range it
// covers, using Evening's own window (which — being 18:00-04:00 —
// `crossesMidnight` into the next calendar day).
function availabilityEntryToRange(entry: string): TimeRange | null {
  const [date, slot] = entry.split(" ");
  const window = TIME_SLOT_WINDOWS[slot];
  if (!date || !window) return null;

  const endDate = window.crossesMidnight ? addDays(date, 1) : date;

  return {
    start: toTimestamp(date, window.start),
    end: toTimestamp(endDate, window.end),
  };
}

// Merges overlapping/adjacent ranges (already sorted by start) into the
// fewest continuous spans — e.g. a volunteer who ticked both Afternoon and
// Evening for the same date is really saying "free from 13:00 straight
// through to 04:00", one span, not two separate three-hour ones.
function mergeRanges(ranges: TimeRange[]): TimeRange[] {
  const merged: TimeRange[] = [];

  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

// A shift is eligible for a volunteer when its full duration — real start
// to real end, across midnight if needed — falls inside one continuous
// stretch of their self-reported availability. This no longer looks at the
// shift's own `slot` at all: a shift that happens to straddle two dagdelen
// (e.g. 12:00-14:00) is still correctly matched as long as the volunteer
// ticked both of the slots it spans, instead of being rejected for everyone
// just because it doesn't fit neatly inside a single slot's window.
export function isVolunteerAvailableForShift(
  availabilityEntries: string[],
  shift: ShiftTimeInfo,
): boolean {
  if (availabilityEntries.length === 0) return true;

  const shiftStart = toTimestamp(shift.date, shift.startTime);
  const shiftEnd = toTimestamp(shift.endDate, shift.endTime);

  const ranges = availabilityEntries
    .map(availabilityEntryToRange)
    .filter((range): range is TimeRange => range !== null)
    .sort((a, b) => a.start - b.start);

  return mergeRanges(ranges).some(
    (range) => range.start <= shiftStart && shiftEnd <= range.end,
  );
}

type ShiftRange = { date: string; endDate: string; startTime: string; endTime: string };

export function hasOverlap(shift: ShiftRange, otherShifts: ShiftRange[]): boolean {
  const start = toTimestamp(shift.date, shift.startTime);
  const end = toTimestamp(shift.endDate, shift.endTime);

  return otherShifts.some((other) => {
    const otherStart = toTimestamp(other.date, other.startTime);
    const otherEnd = toTimestamp(other.endDate, other.endTime);
    return start < otherEnd && otherStart < end;
  });
}

// Only "1"/"2"/"3" are a concrete self-reported cap — "4+" and "No
// preference" never trigger the warning (see SHIFT_COUNT_PREFERENCES in
// constants.ts; matches how the optimizer treats them as a floor/no target
// rather than a ceiling in optimizer/optimizer.py). This never blocks an
// assignment, it's purely a visual nudge for admins.
export function hasReachedShiftPreference(volunteer: VolunteerRow): boolean {
  const preferred = Number(volunteer.shiftCountPreference);
  if (![1, 2, 3].includes(preferred)) return false;

  const activeShifts = volunteer.assignments.filter(
    (a) => a.status !== "cancelled",
  ).length;

  return activeShifts >= preferred;
}
