import { TIME_SLOT_WINDOWS } from "@/lib/constants";
import type { VolunteerRow } from "@/lib/adminVolunteers";

export type ShiftTimeInfo = {
  date: string;
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

export function hasOverlap(
  shift: { date: string; startTime: string; endTime: string },
  otherShifts: { date: string; startTime: string; endTime: string }[],
): boolean {
  return otherShifts.some(
    (other) =>
      other.date === shift.date &&
      shift.startTime < other.endTime &&
      other.startTime < shift.endTime,
  );
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
