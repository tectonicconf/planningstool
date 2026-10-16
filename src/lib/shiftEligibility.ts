import { TIME_SLOT_WINDOWS, AVAILABILITY_OPTIONS } from "@/lib/constants";
import type { VolunteerRow } from "@/lib/adminVolunteers";

// A volunteer's stored availability entry can be in either of two formats,
// depending on how that volunteer entered the system:
// - the short "<date> <slot>" form (e.g. "2026-10-20 Evening") — what the
//   admin "+ Add volunteer" form stores, and what the optimizer's CSV
//   pipeline writes (load_data.py);
// - the human-readable Tally label (e.g. "October 20 - Evening (Hackathon
//   or Setup)") — what a direct Tally/Supabase import preserves as-is,
//   bypassing the optimizer pipeline's normalization.
// This looks a label up against AVAILABILITY_OPTIONS first, falling back
// to parsing the short form, so either source works.
const dateSlotByLabel = new Map(
  AVAILABILITY_OPTIONS.map((option) => [option.label, { date: option.date, slot: option.slot }]),
);

// Public version of the label-or-short-form resolution described above —
// also used by VolunteersBoard.tsx's availability badges, which otherwise
// hit the same mismatch (comparing a raw label against the short-form
// `availabilityValue()` output always fails for label-formatted data).
export function resolveAvailabilityEntry(
  entry: string,
): { date: string; slot: string } | null {
  const trimmed = entry.trim();
  const labelMatch = dateSlotByLabel.get(trimmed);
  if (labelMatch) return labelMatch;

  const [date, slot] = trimmed.split(" ");
  return date && slot ? { date, slot } : null;
}

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
// `days` can be negative (used by getDisplayDate below) — the Date
// constructor rolls the month/year back correctly either way.
export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(year, month - 1, day + days);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, "0");
  const d = String(next.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Which day a shift should be grouped under on a day-by-day view — not
// always its literal `date`. A shift starting between 00:00 and 04:00 is
// clock-wise "the next day", but it's really the tail end of the previous
// evening (the Evening slot's own window runs 18:00-04:00 for the same
// reason) — e.g. a 01:00-03:00 breakdown shift stored as Oct 21 is really
// "Oct 20 night" and should show up on the Oct 20 tab, not get a day of its
// own with nothing else in it.
export function getDisplayDate(date: string, startTime: string): string {
  return startTime < TIME_SLOT_WINDOWS.Evening.end ? addDays(date, -1) : date;
}

type TimeRange = { start: number; end: number };

// A volunteer's availability is self-reported per dagdeel, not exact hours
// (see AVAILABILITY_OPTIONS and the format note above `dateSlotByLabel`).
// This turns one such entry into the real timestamp range it covers, using
// that slot's own window (Evening's — being 18:00-04:00 — `crossesMidnight`
// into the next calendar day).
function availabilityEntryToRange(entry: string): TimeRange | null {
  const resolved = resolveAvailabilityEntry(entry);
  if (!resolved) return null;

  const window = TIME_SLOT_WINDOWS[resolved.slot];
  if (!window) return null;

  const endDate = window.crossesMidnight ? addDays(resolved.date, 1) : resolved.date;

  return {
    start: toTimestamp(resolved.date, window.start),
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

// Whether a volunteer's ticked "<date> <slot>" availability badge should
// show as taken — i.e. whether any of their real (non-cancelled)
// assignments overlaps that slot's actual time window at all. Deliberately
// time-based rather than comparing `assignment.slot` against `slot` as
// strings: an assigned shift's own `slot` can be in a different vocabulary
// (e.g. "Namiddag" from a direct import, vs. the "Afternoon" an admin-
// created volunteer's availability uses) and would never match, or the
// assignment can simply run a bit past the slot's nominal end (a 14:00-
// 18:30 shift still occupies the 13:00-18:00 Afternoon slot) — matching
// exact strings would miss both cases, where overlapping time ranges
// doesn't.
export function isAvailabilitySlotOccupied(
  assignments: ShiftRange[],
  date: string,
  slot: string,
): boolean {
  const window = TIME_SLOT_WINDOWS[slot];
  if (!window) return false;

  const slotEndDate = window.crossesMidnight ? addDays(date, 1) : date;
  const slotStart = toTimestamp(date, window.start);
  const slotEnd = toTimestamp(slotEndDate, window.end);

  return assignments.some((assignment) => {
    const start = toTimestamp(assignment.date, assignment.startTime);
    const end = toTimestamp(assignment.endDate, assignment.endTime);
    return start < slotEnd && slotStart < end;
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
