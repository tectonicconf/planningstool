import type { Shift } from "@/lib/shifts";

// Shifts sharing the same non-empty `templateKey` are blocks of one
// combined shift ("template") that a volunteer accepts/declines as a whole —
// see the comment on `Shift.templateKey` in shifts.ts.
export type TemplateStatus = "pending" | "confirmed" | "partial";

export function templateStatus(blocks: Shift[]): TemplateStatus {
  const confirmedCount = blocks.filter((block) => block.status === "confirmed").length;
  if (confirmedCount === 0) return "pending";
  if (confirmedCount === blocks.length) return "confirmed";
  return "partial";
}

export function templateHours(blocks: Shift[]): number {
  return blocks.reduce((sum, block) => sum + block.hours, 0);
}

// Blocks are assumed pre-sorted by start time (how getShiftsForVolunteer
// already returns them) — the overall span is just the first block's start
// through the last block's end.
export function templateTimeRange(blocks: Shift[]): {
  date: string;
  startTime: string;
  endTime: string;
} {
  const first = blocks[0];
  const last = blocks[blocks.length - 1];
  return { date: first.date, startTime: first.startTime, endTime: last.endTime };
}

export function pendingBlocks(blocks: Shift[]): Shift[] {
  return blocks.filter((block) => block.status === "pending");
}
