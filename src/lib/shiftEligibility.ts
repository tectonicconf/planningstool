import { TIME_SLOT_WINDOWS } from "@/lib/constants";

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
