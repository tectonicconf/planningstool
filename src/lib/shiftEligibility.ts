import { TIME_SLOT_WINDOWS } from "@/lib/constants";
import type { VolunteerRow } from "@/lib/adminVolunteers";

export type ShiftTimeInfo = {
  date: string;
  endDate: string;
  slot: string;
  startTime: string;
  endTime: string;
};

export function isVolunteerAvailableForShift(
  availabilityEntries: string[],
  shift: ShiftTimeInfo,
): boolean {
  if (availabilityEntries.length === 0) return true;

  const slotWindow = TIME_SLOT_WINDOWS[shift.slot];
  const fitsWindow =
    !!slotWindow && shift.startTime >= slotWindow.start && shift.endTime <= slotWindow.end;

  return availabilityEntries.includes(`${shift.date} ${shift.slot}`) && fitsWindow;
}

type ShiftRange = { date: string; endDate: string; startTime: string; endTime: string };

// Combines each shift's own start/end date with its start/end time into
// real timestamps, so a shift that runs past midnight (date !== endDate)
// compares correctly against same-evening shifts — comparing bare "HH:MM"
// strings instead would treat "00:00" as the earliest possible time rather
// than the latest, making a midnight-crossing shift look like it never
// overlaps with anything later that evening.
function toTimestamp(date: string, time: string): number {
  return new Date(`${date}T${time}`).getTime();
}

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
